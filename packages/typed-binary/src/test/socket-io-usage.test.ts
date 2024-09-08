import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { type Socket as ClientSocket, io as ioClient } from 'socket.io-client';

import { dynamicArrayOf, object } from '../describe';
import { BufferReader, BufferWriter } from '../io';
import { byte, string, u32 } from '../structure';
import type { AnySchema } from '../structure/types';
import type { Parsed } from '../utilityTypes';

function waitFor(socket: ServerSocket | ClientSocket, event = 'message') {
  return new Promise<Buffer>((resolve) => {
    socket.once(event, resolve);
  });
}

describe('Socket IO Usage', () => {
  let io: Server;
  let serverSocket: ServerSocket;
  let clientSocket: ClientSocket;

  beforeAll(
    () =>
      new Promise((resolve) => {
        const httpServer = createServer();
        io = new Server(httpServer);

        httpServer.listen(() => {
          const port = (httpServer.address() as AddressInfo).port;
          clientSocket = ioClient(`http://localhost:${port}`);

          io.on('connection', (socket) => {
            serverSocket = socket;
          });

          clientSocket.on('connect', resolve);
        });
      }),
  );

  async function sendAndReceive<TSchema extends AnySchema>(
    direction: 'server-to-client' | 'client-to-server',
    schema: TSchema,
    value: Parsed<TSchema>,
  ) {
    const [from, to] =
      direction === 'server-to-client'
        ? [serverSocket, clientSocket]
        : [clientSocket, serverSocket];

    const buffer = Buffer.alloc(schema.measure(value).size);
    schema.write(new BufferWriter(buffer), value);
    from.send(buffer);

    // Receiving

    const response = schema.read(new BufferReader(await waitFor(to)));
    expect(response).to.deep.equal(value);
  }

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it('should send a byte array successfully', async () => {
    const schema = dynamicArrayOf(byte);

    await sendAndReceive('server-to-client', schema, [1, 2, 254, 255]);
  });

  it('should send a basic struct successfully', async () => {
    const schema = object({
      name: string,
      age: u32,
    });

    await sendAndReceive('server-to-client', schema, {
      name: 'James Huns',
      age: 15,
    });
  });
});

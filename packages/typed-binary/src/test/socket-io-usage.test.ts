import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server, type Socket as ServerSocket } from 'socket.io';
import { type Socket as ClientSocket, io as ioClient } from 'socket.io-client';

// Importing from the public API
import bin, { type AnySchema } from '../index.ts';

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
    value: bin.Parsed<TSchema>,
  ) {
    const [from, to] =
      direction === 'server-to-client'
        ? [serverSocket, clientSocket]
        : [clientSocket, serverSocket];

    const buffer = Buffer.alloc(schema.measure(value).size);
    schema.write(new bin.BufferWriter(buffer), value);
    from.send(buffer);

    // Receiving

    const response = schema.read(new bin.BufferReader(await waitFor(to)));
    expect(response).to.deep.equal(value);
  }

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it('should send a byte array successfully', async () => {
    const schema = bin.dynamicArrayOf(bin.u8);

    await sendAndReceive('server-to-client', schema, [1, 2, 254, 255]);
  });

  it('should send a basic struct successfully', async () => {
    const schema = bin.object({
      name: bin.string,
      age: bin.u32,
    });

    await sendAndReceive('server-to-client', schema, {
      name: 'James Huns',
      age: 15,
    });
  });
});

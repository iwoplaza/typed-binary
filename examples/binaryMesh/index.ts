import { BufferReader, BufferWriter, readSerial, writeSerial } from 'typed-binary';
import fs from 'fs/promises';
import { Mesh, MeshHelper } from './schemas';

const DEFAULT_MESH: Mesh = {
    faces: [
        {
            vertices: [
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 0, z: 0.1 },
                { x: 0, y: 1, z: -0.1 },
            ]
        }
    ],
};

async function loadMesh(): Promise<Mesh> {
    try {
        const buffer = await fs.readFile('./mesh.bin');
        const reader = new BufferReader(buffer);

        return readSerial<typeof Mesh>(reader, Mesh);
    }
    catch (e) {
        return DEFAULT_MESH;
    }
}

async function saveMesh(mesh: Mesh): Promise<void> {
    try {
        const buffer = Buffer.alloc(MeshHelper.sizeOf(mesh));
        const writer = new BufferWriter(buffer);

        writeSerial<typeof Mesh>(writer, Mesh, mesh);

        await fs.writeFile('./mesh.bin', buffer);
    }
    catch (e) {
        console.error(`Error occurred during mesh saving.`);
        console.error(e);
    }
}

function meshToString(mesh: Mesh): string {
    let text = '';
    for (const face of mesh.faces) {
        for (const v of face.vertices) {
            text += `(${v.x}, ${v.y}, ${v.z}) `;
        }
    }
    return text;
}

async function init() {
    // Loading the mesh
    const mesh = await loadMesh();
    console.log(meshToString(mesh));

    // Translating the mesh
    mesh.faces.forEach(f => {
        f.vertices.forEach(v => {
            v.x += 1;
        });
    });

    // Storing the mesh
    await saveMesh(mesh);
}

init();
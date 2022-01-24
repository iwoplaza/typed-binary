import * as mocha from 'mocha';
import * as chai from 'chai';
import { BufferWriter } from './bufferWriter';
import { BufferReader } from './bufferReader';
import { randBetween, randIntBetween } from '../../test/random';

const expect = chai.expect;
describe('BufferWriter/BufferReader', () => {
    it('should encode and decode int sequence', () => {
        // Generating random int sequence
        const intList = [];
        for (let i = 0; i < randIntBetween(1, 10); ++i) {
            intList.push(randIntBetween(-100, 100));
        }

        // Creating appropriate buffer
        const buffer = Buffer.alloc(intList.length * 4);

        // Writer
        const writer = new BufferWriter(buffer);

        // Writing the ints
        for (let int of intList) {
            writer.writeInt(int);
        }

        // Expecting specific buffer offset
        expect(writer.currentByteOffset).to.equal(intList.length * 4);
        
        // Reading the ints
        const reader = new BufferReader(buffer);
        for (let i = 0; i < intList.length; ++i) {
            expect(reader.readInt()).to.equal(intList[i]);
        }
    });

    it('should encode and decode float sequence', () => {
        // Generating random int sequence
        const floatList = [];
        for (let i = 0; i < randIntBetween(1, 10); ++i) {
            floatList.push(randBetween(-100, 100));
        }

        // Creating appropriate buffer
        const buffer = Buffer.alloc(floatList.length * 4);

        // Writer
        const writer = new BufferWriter(buffer);

        // Writing the ints
        for (let float of floatList) {
            writer.writeFloat(float);
        }

        // Expecting specific buffer offset
        expect(writer.currentByteOffset).to.equal(floatList.length * 4);
        
        // Reading the ints
        const reader = new BufferReader(buffer);
        for (let i = 0; i < floatList.length; ++i) {
            expect(reader.readFloat()).to.be.closeTo(floatList[i], 0.001);
        }
    });
});
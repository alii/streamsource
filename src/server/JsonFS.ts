import * as fs from 'fs';
import * as path from 'path';
import { Stream, StreamResolvable } from './interfaces/Stream';

const file = process.env.JSON_FS_STORAGE_PATH ?? path.join(__dirname, '..', 'store.json');

class NoStreamError extends Error {
  readonly message: 'Could not find stream';
}

type StreamObjectResult = Record<Stream['id'], Stream>;

/**
 * Union type, these are values that don't ever change
 */
type StreamStaticProperties = 'id';

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, '[]');
}

export class JsonFS {
  /**
   * Pushes a stream to storage
   * @param stream
   */
  static push(stream: Omit<Stream, StreamStaticProperties>): void {
    this._write([...this._read(), this._form(stream)]);
  }

  /**
   * Creates a stream
   * @param stream The stream object, do not include id!!
   */
  static create(stream: Omit<Stream, StreamStaticProperties>): Stream {
    const id = this._id();
    const content: Stream = { ...stream, id };
    this.push(content);
    return content;
  }

  /**
   * Updates a stream
   * @param query The query to find a stream
   * @param update The data to update in the stream
   */
  static patch(query: Partial<Stream>, update: Partial<Omit<Stream, StreamStaticProperties>>): void {
    const queryEntries = Object.entries(query);

    // Dear Robert, the owner of the TypeScript community.
    // This ts-ignore is here because at runtime, somebody may edit and use
    // req.body to post the ID. So, to prevent that, I am checking if it
    // exists at runtime rather than compile time to prevent it. Thank
    // you for not shouting at me for using ts-ignore.

    // Kind regards,
    // Alistair Smith

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (update.id) {
      throw new Error('Cannot update ID of a stream.');
    }

    const streams = this._read().reduce((streams, stream) => {
      const matched = queryEntries.every((entry) => {
        const [key, value] = entry;
        return stream[key] === value;
      });

      if (matched) {
        const updated: Stream = {
          ...stream,
          ...update,
        } as const;

        return [...streams, updated];
      } else {
        return [...streams, stream];
      }
    }, [] as Stream[]);

    this._write(streams);
  }

  /**
   * Returns an object rather than an array of streams, where the key is the id of the stream
   */
  static object(): StreamObjectResult {
    const data = this._read();
    return data.reduce((all, stream) => {
      return {
        ...all,
        [stream.id]: stream,
      };
    }, {} as StreamObjectResult);
  }

  /**
   * Returns the streams as a JSON array string
   */
  static json(): string {
    return JSON.stringify(this._read());
  }

  /**
   * Generates an ID
   * @param length The length of the ID to generate
   * @param alphabet The alphabet to choose characters from. Does not dedupe multiples!
   * @private
   */
  private static _id(length = 20, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    const arr = [...new Array(length)];

    return arr.reduce((str) => {
      return str + alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }, '');
  }

  /**
   * Push multiple streams to the store
   * @param streams
   */
  static pushMultiple(streams: Omit<Stream, StreamStaticProperties>[]): void {
    this._write([...this._read(), ...streams.map(this._form)]);
  }

  /**
   * Forms a stream object from
   * @param stream The stream object
   */
  private static _form(stream: Omit<Stream, StreamStaticProperties>) {
    return { ...stream, id: this._id() };
  }

  /**
   * Finds a stream from an ID
   * @param idOrCallback
   */
  static find(idOrCallback: Stream['id'] | ((stream: Stream) => boolean)): Stream {
    const streams = this._read();

    if (typeof idOrCallback === 'function') {
      return streams.find(idOrCallback);
    } else if (typeof idOrCallback === 'string') {
      return this._read().find((stream) => stream.id === idOrCallback);
    } else {
      return null;
    }
  }

  /**
   * Gets all streams
   */
  static array(): Stream[] {
    return this._read();
  }

  /**
   * Finds and removes a stream from storage
   * @param _stream
   */
  static delete(_stream: StreamResolvable): void {
    const stream = this._resolve(_stream);

    if (!stream) {
      throw new NoStreamError();
    }

    const streams = this._read();
    this._write(streams.filter((s) => s.id !== stream.id));
  }

  /**
   * Resolves a stream
   * @param stream The stream, id or object
   * @private
   */
  private static _resolve(stream: StreamResolvable): Stream {
    if (typeof stream === 'string') {
      const streams = this._read();
      return streams.find((s) => s.id === stream);
    } else {
      return stream;
    }
  }

  /**
   * Reads data from storage
   * @param encoding The encoding of the file
   * @private
   */
  private static _read(encoding: BufferEncoding = 'utf-8'): Stream[] {
    const content = fs.readFileSync(file).toString(encoding);
    return JSON.parse(content);
  }

  /**
   * Writes data to the storage
   * @param content The content to write
   * @param encoding The encoding of the file
   * @private
   */
  private static _write(content: Stream[], encoding: BufferEncoding = 'utf-8'): void {
    const data = JSON.stringify(content);
    fs.writeFileSync(file, data, { encoding });
  }
}

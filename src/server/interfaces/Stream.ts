export type HTMLContent = string;

export interface Stream {
  readonly height: number;
  readonly width: number;
  readonly id: string;
  readonly elements: StreamElement[];
}

export interface StreamElement {
  readonly x: number;
  readonly y: number;
  readonly content: HTMLContent;
}

export type StreamResolvable = Stream | Stream['id'];

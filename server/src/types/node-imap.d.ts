import Imap from 'node-imap';

declare module 'node-imap' {
  export default interface Connection {
    idle(): void;
  }
}

// Type augmentation for node-imap to add idle() method
import Imap from 'node-imap';

declare module 'node-imap' {
  export default interface Connection {
    idle(): void;
  }
}

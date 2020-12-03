// Declare missing modules

declare module '@aws-amplify/ui';
declare module 'aws-amplify-react-native' {

  export const AmplifyTheme: any
  export type AuthState = 'requireNewPassword' | 'greetings' | 'totpSetup' | 'loading' | 'signIn' | 'signUp' | 'confirmSignIn' | 'confirmSignUp' | 'forgotPassword' | 'verifyContact' | 'signedIn' | 'signedUp'
  export class Authenticator extends React.Component<any, any> {}
  export interface AuthTheme {
  }
  export interface AuthPieceProps {
    onStateChange?: (state: AuthState, data: any) => void
    errorMessage?: string
    authState: AuthState
    authData: any
    theme?: AuthTheme
  }
  export class AuthPiece extends React.Component<AuthPieceProps> {
    constructor(props: AuthPieceProps);
  }

  export class SignIn extends AuthPiece {}
  export class ConfirmSignIn extends AuthPiece {}
  export class SignUp extends AuthPiece {}
  export class ConfirmSignUp extends AuthPiece {}
  export class ForgotPassword extends AuthPiece {}
  export class Loading extends AuthPiece {}
  export class RequireNewPassword extends AuthPiece {}
  export class VerifyContact extends AuthPiece {}
  export class Greetings extends AuthPiece {}

}

// Fix some missing imports from the dom lib. dom conflicts with the react-native global types.
declare interface Storage {}
declare interface Cache {}
declare interface ServiceWorker {}

// Fix some imports that are for code that also works in node
// declare class Buffer {
//   static from(string, string): Buffer
// }

declare module 'buffer' {
  // FIXME: somehow we should figure out why this isn't getting
  // pullled in automatically from https://github.com/feross/buffer/blob/master/index.d.ts
  export class Buffer {
    constructor(str: string, encoding?: string)
    constructor(length: number)
    length: number
    write(string: string, offset?: number, length?: number, encoding?: string): number
    slice(start: number, end: number): Buffer
    copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number
    writeInt8(value: number, offset: number, noAssert?: boolean): number
    writeUInt8(value: number, offset: number, noAssert?: boolean): number
    writeUInt16BE(value: number, offset: number, noAssert?: boolean): number
    writeUInt16LE(value: number, offset: number, noAssert?: boolean): number
    writeUInt32BE(value: number, offset: number, noAssert?: boolean): number
    writeUInt32LE(value: number, offset: number, noAssert?: boolean): number
    writeFloatLE(value: number, offset: number, noAssert?: boolean): number
    writeFloatBE(value: number, offset: number, noAssert?: boolean): number
    readInt8(offset: number, noAssert?: boolean): number
    readUInt8(offset: number, noAssert?: boolean): number
    readUInt16BE(offset: number, noAssert?: boolean): number
    readUInt16LE(offset: number, noAssert?: boolean): number
    readUInt32BE(offset: number, noAssert?: boolean): number
    readUInt32LE(offset: number, noAssert?: boolean): number
    readFloatBE(offset: number): number
    readFloatLE(offset: number): number
    toString(encoding?: string, start?: number, end?: number): string
    static concat(list: Buffer[], totalLength?: number): Buffer;
  }
}
declare module 'stream' {
  export interface Readable {}
  export interface Stream {}
}
declare namespace NodeJS {
  interface ReadableStream {}
}
declare module 'http' {
  export interface Agent {}
}
declare module 'https' {
  export interface Agent {}
}

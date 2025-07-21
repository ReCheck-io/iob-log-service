import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'addLog' : ActorMethod<
    [string, string, string, string, [] | [any]],
    {
        'Ok' : {
          'id' : Principal,
          'action' : string,
          'data' : [] | [any],
          'hash' : string,
          'createdAt' : bigint,
          'uuid' : string,
          'serviceId' : Principal,
          'userFingerprint' : string,
        }
      } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'getAllLogs' : ActorMethod<
    [],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'data' : [] | [any],
            'hash' : string,
            'createdAt' : bigint,
            'uuid' : string,
            'serviceId' : Principal,
            'userFingerprint' : string,
          }
        >
      } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogsByAction' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'data' : [] | [any],
            'hash' : string,
            'createdAt' : bigint,
            'uuid' : string,
            'serviceId' : Principal,
            'userFingerprint' : string,
          }
        >
      } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogsByUserFingerprint' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'data' : [] | [any],
            'hash' : string,
            'createdAt' : bigint,
            'uuid' : string,
            'serviceId' : Principal,
            'userFingerprint' : string,
          }
        >
      } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'getLogsByUuid' : ActorMethod<
    [string],
    {
        'Ok' : Array<
          {
            'id' : Principal,
            'action' : string,
            'data' : [] | [any],
            'hash' : string,
            'createdAt' : bigint,
            'uuid' : string,
            'serviceId' : Principal,
            'userFingerprint' : string,
          }
        >
      } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'initializeCanister' : ActorMethod<
    [Principal],
    { 'Ok' : { 'id' : Principal, 'createdAt' : bigint } } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
  'verifyLog' : ActorMethod<
    [string, string, string, string],
    { 'Ok' : { 'valid' : boolean, 'hash' : string } } |
      {
        'Err' : { 'NotFound' : string } |
          { 'ValidationError' : string } |
          { 'Unauthorized' : string } |
          { 'InternalError' : string } |
          { 'Conflict' : string }
      }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

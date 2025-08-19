import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  getAllBuildings: ActorMethod<
    [],
    | {
        Ok: Array<{
          ledgerCanisterId: Principal;
          deployedAt: bigint;
          owner: Principal;
          metadata: [] | [{}];
          name: string;
          uuid: string;
          lastUpdated: bigint;
          description: string;
          version: string;
          tokenSymbol: string;
          tokenName: string;
          buildingHash: string;
          buildingType: [] | [string];
          location: [] | [string];
        }>;
      }
    | {
        Err:
          | { NotFound: string }
          | { ValidationError: string }
          | { Unauthorized: string }
          | { InternalError: string }
          | { Conflict: string };
      }
  >;
  getBuilding: ActorMethod<
    [string],
    | {
        Ok: {
          ledgerCanisterId: Principal;
          deployedAt: bigint;
          owner: Principal;
          metadata: [] | [{}];
          name: string;
          uuid: string;
          lastUpdated: bigint;
          description: string;
          version: string;
          tokenSymbol: string;
          tokenName: string;
          buildingHash: string;
          buildingType: [] | [string];
          location: [] | [string];
        };
      }
    | {
        Err:
          | { NotFound: string }
          | { ValidationError: string }
          | { Unauthorized: string }
          | { InternalError: string }
          | { Conflict: string };
      }
  >;
  getUserBuildings: ActorMethod<
    [Principal],
    | {
        Ok: Array<{
          ledgerCanisterId: Principal;
          deployedAt: bigint;
          owner: Principal;
          metadata: [] | [{}];
          name: string;
          uuid: string;
          lastUpdated: bigint;
          description: string;
          version: string;
          tokenSymbol: string;
          tokenName: string;
          buildingHash: string;
          buildingType: [] | [string];
          location: [] | [string];
        }>;
      }
    | {
        Err:
          | { NotFound: string }
          | { ValidationError: string }
          | { Unauthorized: string }
          | { InternalError: string }
          | { Conflict: string };
      }
  >;
  initializeCanister: ActorMethod<
    [Principal],
    | { Ok: { id: Principal; createdAt: bigint } }
    | {
        Err:
          | { NotFound: string }
          | { ValidationError: string }
          | { Unauthorized: string }
          | { InternalError: string }
          | { Conflict: string };
      }
  >;
  registerBuilding: ActorMethod<
    [string, Principal, Principal, string, string, string, string],
    | {
        Ok: {
          ledgerCanisterId: Principal;
          deployedAt: bigint;
          owner: Principal;
          metadata: [] | [{}];
          name: string;
          uuid: string;
          lastUpdated: bigint;
          description: string;
          version: string;
          tokenSymbol: string;
          tokenName: string;
          buildingHash: string;
          buildingType: [] | [string];
          location: [] | [string];
        };
      }
    | {
        Err:
          | { NotFound: string }
          | { ValidationError: string }
          | { Unauthorized: string }
          | { InternalError: string }
          | { Conflict: string };
      }
  >;
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

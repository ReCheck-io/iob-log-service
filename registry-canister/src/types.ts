import { IDL, Principal } from 'azle';

// Service represents an authorized service that can call this canister
export interface Service {
  id: Principal;
  createdAt: bigint;
}

// Building information stored in the registry
export interface BuildingInfo {
  uuid: string;
  ledgerCanisterId: Principal;
  owner: Principal;
  name: string;
  tokenSymbol: string;
  tokenName: string;
  deployedAt: bigint;
  lastUpdated: bigint;
}

// Request type for registering a new building
export interface RegisterBuildingRequest {
  uuid: string;
  ledgerCanisterId: Principal;
  owner: Principal;
  name: string;
  tokenSymbol: string;
  tokenName: string;
}

// Error types for canister operations
export type ErrorType =
  | { NotFound: string }
  | { Unauthorized: string }
  | { Conflict: string }
  | { ValidationError: string }
  | { InternalError: string };

// IDL definitions for canister interface
export const BuildingInfoIDL = IDL.Record({
  uuid: IDL.Text,
  ledgerCanisterId: IDL.Principal,
  owner: IDL.Principal,
  name: IDL.Text,
  tokenSymbol: IDL.Text,
  tokenName: IDL.Text,
  deployedAt: IDL.Nat64,
  lastUpdated: IDL.Nat64,
});

export const ErrorIDL = IDL.Variant({
  NotFound: IDL.Text,
  Unauthorized: IDL.Text,
  Conflict: IDL.Text,
  ValidationError: IDL.Text,
  InternalError: IDL.Text,
});

// Result types with IDL
export const BuildingResultIDL = IDL.Variant({
  Ok: BuildingInfoIDL,
  Err: ErrorIDL,
});

export const BuildingArrayResultIDL = IDL.Variant({
  Ok: IDL.Vec(BuildingInfoIDL),
  Err: ErrorIDL,
});

export const ServiceIDL = IDL.Record({
  id: IDL.Principal,
  createdAt: IDL.Nat64,
});
export const ServiceResultIDL = IDL.Variant({
  Ok: ServiceIDL,
  Err: ErrorIDL,
});

// Regular types for operations
export type BuildingResult = { Ok: BuildingInfo } | { Err: ErrorType };
export type BuildingArrayResult = { Ok: BuildingInfo[] } | { Err: ErrorType };
export type ServiceResult = { Ok: Service } | { Err: ErrorType };
export type InitResult = { Ok: string } | { Err: string };

import { IDL, Principal } from "azle";

// Log represents an immutable audit log entry
export type Log = {
  id: Principal;
  hash: string;
  uuid: string;
  action: string;
  userFingerprint: string;
  data?: any; // Optional flexible payload for maximum data storage
  serviceId: Principal;
  createdAt: bigint;
};

// Service represents an authorized service that can call this canister
export type Service = {
  id: Principal;
  createdAt: bigint;
};

// Error types for canister operations
export type ErrorType = 
  | { Unauthorized: string }
  | { Conflict: string }
  | { NotFound: string }
  | { ValidationError: string }
  | { InternalError: string };

// Result types (manually defined to match current Azle patterns)
export type LogResult = { Ok: Log } | { Err: ErrorType };
export type LogResultArray = { Ok: Log[] } | { Err: ErrorType };
export type ServiceResult = { Ok: Service } | { Err: ErrorType };
export type LogIntegrityResult = { Ok: { valid: boolean; hash: string } } | { Err: ErrorType };

// IDL definitions for canister interface
export const LogIDL = IDL.Record({
  id: IDL.Principal,
  hash: IDL.Text,
  uuid: IDL.Text,
  action: IDL.Text,
  userFingerprint: IDL.Text,
  data: IDL.Opt(IDL.Reserved), // Flexible payload structure using Reserved
  serviceId: IDL.Principal,
  createdAt: IDL.Nat64,
});

export const ServiceIDL = IDL.Record({
  id: IDL.Principal,
  createdAt: IDL.Nat64,
});

export const ErrorIDL = IDL.Variant({
  NotFound: IDL.Text,
  Unauthorized: IDL.Text,
  Conflict: IDL.Text,
  ValidationError: IDL.Text,
  InternalError: IDL.Text,
});

export const LogResultIDL = IDL.Variant({
  Ok: LogIDL,
  Err: ErrorIDL,
});

export const LogResultArrayIDL = IDL.Variant({
  Ok: IDL.Vec(LogIDL),
  Err: ErrorIDL,
});

export const ServiceResultIDL = IDL.Variant({
  Ok: ServiceIDL,
  Err: ErrorIDL,
});

export const LogIntegrityResultIDL = IDL.Variant({
  Ok: IDL.Record({ valid: IDL.Bool, hash: IDL.Text }),
  Err: ErrorIDL,
});
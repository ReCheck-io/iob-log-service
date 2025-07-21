import {
  IDL,
  Principal,
  query,
  update,
  StableBTreeMap,
  time,
  caller,
  isController,
} from "azle";

import { generateId, handleError, validateHash } from "./utils";
import {
  Service,
  Log,
  LogResult,
  LogResultArray,
  ServiceResult,
  LogIntegrityResult,
  LogResultIDL,
  LogResultArrayIDL,
  ServiceResultIDL,
  LogIntegrityResultIDL,
} from "./types";

export default class IobCanister {
  serviceStorage = StableBTreeMap<Principal, Service>(0);
  logStorage = StableBTreeMap<Principal, Log>(1);

  // Optional init hook - if serviceId provided during deployment, auto-authorize it
  init(serviceId?: Principal): void {
    if (serviceId) {
      const newService: Service = {
        id: serviceId,
        createdAt: time(),
      };
      this.serviceStorage.insert(serviceId, newService);
    }
    // If no serviceId provided, skip initialization - can be done manually later
  }

  // Fallback method - manual authorization if missed during deployment
  @update([IDL.Principal], ServiceResultIDL)
  initializeCanister(serviceId: Principal): ServiceResult {
    try {
      if (!isController(caller())) {
        throw { Unauthorized: "Unauthorized access!" };
      }

      if (this.serviceStorage.containsKey(serviceId)) {
        throw { Conflict: "Service already authorized!" };
      }

      const newService: Service = {
        id: serviceId,
        createdAt: time(),
      };

      this.serviceStorage.insert(serviceId, newService);
      return { Ok: newService };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  // Add a new log entry with pre-calculated hash and optional data payload
  @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Reserved)], LogResultIDL)
  addLog(
    uuid: string,
    action: string,
    userFingerprint: string,
    hash: string,
    data?: any
  ): LogResult {
    try {
      this.authorizeCaller();
      validateHash(hash);

      // Check if hash already exists by searching all logs
      const existingLogs = this.logStorage.values().filter(log => log.hash === hash);
      if (existingLogs.length > 0) {
        throw { Conflict: "Hash already exists" };
      }

      // Create the log entry
      const log: Log = {
        id: generateId(),
        hash,
        uuid,
        action: action.toLowerCase(),
        userFingerprint,
        data: data || null, // Store the complete payload for audit purposes
        serviceId: caller(),
        createdAt: time(),
      };

      this.logStorage.insert(log.id, log);
      return { Ok: log };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  // Verify log integrity by searching with hash and comparing data
  @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text], LogIntegrityResultIDL)
  verifyLog(hash: string, uuid: string, action: string, userFingerprint: string): LogIntegrityResult {
    try {
      this.authorizeCaller();
      validateHash(hash);

      // Find log entry by hash
      const logs = this.logStorage.values().filter(log => log.hash === hash);

      if (logs.length === 0) {
        return { Err: { NotFound: "No log found with the provided hash" } };
      }

      const foundLog = logs[0];

      // Verify all components match
      const isValid = 
        foundLog.uuid === uuid &&
        foundLog.action === action.toLowerCase() &&
        foundLog.userFingerprint === userFingerprint;

      return { Ok: { valid: isValid, hash: foundLog.hash } };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  // Query methods
  @query([IDL.Text], LogResultArrayIDL)
  getLogsByUuid(uuid: string): LogResultArray {
    try {
      this.authorizeCaller();
      
      const logs = this.logStorage.values().filter(log => log.uuid === uuid);
      return { Ok: logs };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([IDL.Text], LogResultArrayIDL)
  getLogsByAction(action: string): LogResultArray {
    try {
      this.authorizeCaller();
      
      const logs = this.logStorage.values().filter(log => log.action === action.toLowerCase());
      return { Ok: logs };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([IDL.Text], LogResultArrayIDL)
  getLogsByUserFingerprint(userFingerprint: string): LogResultArray {
    try {
      this.authorizeCaller();
      
      const logs = this.logStorage.values().filter(log => log.userFingerprint === userFingerprint);
      return { Ok: logs };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([], LogResultArrayIDL)
  getAllLogs(): LogResultArray {
    try {
      this.authorizeCaller();
      
      const logs = this.logStorage.values();
      return { Ok: logs };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  // Helper method for authorization
  private authorizeCaller(): void {
    const callerPrincipal = caller();
    
    // Allow controllers (they can always call methods)
    if (isController(callerPrincipal)) {
      return;
    }

    // Check if caller is an authorized service
    if (!this.serviceStorage.containsKey(callerPrincipal)) {
      throw { Unauthorized: "Unauthorized access!" };
    }
  }
}
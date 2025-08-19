import {
  Principal,
  query,
  update,
  StableBTreeMap,
  time,
  caller,
  isController,
  IDL,
} from 'azle';

import { handleError } from './utils';
import {
  BuildingInfo,
  Service,
  ServiceResultIDL,
  ServiceResult,
  BuildingResult,
  BuildingResultIDL,
  BuildingArrayResult,
  BuildingArrayResultIDL,
} from './types';

export default class BuildingRegistry {
  private buildings = StableBTreeMap<string, BuildingInfo>(0);
  private serviceStorage = StableBTreeMap<Principal, Service>(2);

  init(serviceId?: Principal): void {
    if (serviceId) {
      const newService: Service = {
        id: serviceId,
        createdAt: time(),
      };
      this.serviceStorage.insert(serviceId, newService);
    }
  }

  @update([IDL.Principal], ServiceResultIDL)
  initializeCanister(serviceId: Principal): ServiceResult {
    try {
      if (!isController(caller())) {
        throw { Unauthorized: 'Unauthorized access!' };
      }

      if (this.serviceStorage.containsKey(serviceId)) {
        throw { Conflict: 'Service already authorized!' };
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

  @update(
    [
      IDL.Text, // uuid
      IDL.Principal, // ledgerCanisterId
      IDL.Principal, // owner
      IDL.Text, // name
      IDL.Text, // tokenSymbol
      IDL.Text, // tokenName
    ],
    BuildingResultIDL
  )
  registerToken(
    uuid: string,
    ledgerCanisterId: Principal,
    owner: Principal,
    name: string,
    buildingHash: string,
    tokenSymbol: string,
    tokenName: string
  ): BuildingResult {
    try {
      this.authorizeCaller();

      const buildingInfo: BuildingInfo = {
        uuid,
        ledgerCanisterId,
        owner,
        name,
        tokenSymbol,
        tokenName,
        deployedAt: time(),
        lastUpdated: time(),
      };

      this.buildings.insert(uuid, buildingInfo);

      return { Ok: buildingInfo };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([IDL.Text], BuildingResultIDL)
  getBuilding(uuid: string): BuildingResult {
    try {
      this.authorizeCaller();

      const building = this.buildings.get(uuid);
      if (!building) {
        throw { NotFound: `Building not found: ${uuid}` };
      }

      return { Ok: building };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([IDL.Principal], BuildingArrayResultIDL)
  getUserBuildings(owner: Principal): BuildingArrayResult {
    try {
      this.authorizeCaller();

      const buildings = this.buildings
        .values()
        .filter(val => val.owner === owner) as BuildingInfo[];

      return { Ok: buildings };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  @query([], BuildingArrayResultIDL)
  getAllBuildings(): BuildingArrayResult {
    try {
      this.authorizeCaller();

      const buildings = this.buildings.values();
      return { Ok: buildings };
    } catch (error) {
      return { Err: handleError(error) };
    }
  }

  private authorizeCaller(): void {
    const callerPrincipal = caller();

    // Allow controllers
    if (isController(callerPrincipal)) {
      return;
    }

    // Check if caller is an authorized service
    if (!this.serviceStorage.containsKey(callerPrincipal)) {
      throw { Unauthorized: 'Unauthorized access!' };
    }
  }
}

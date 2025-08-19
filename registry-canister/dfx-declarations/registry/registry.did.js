export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    getAllBuildings: IDL.Func(
      [],
      [
        IDL.Variant({
          Ok: IDL.Vec(
            IDL.Record({
              ledgerCanisterId: IDL.Principal,
              deployedAt: IDL.Nat64,
              owner: IDL.Principal,
              metadata: IDL.Opt(IDL.Record({})),
              name: IDL.Text,
              uuid: IDL.Text,
              lastUpdated: IDL.Nat64,
              description: IDL.Text,
              version: IDL.Text,
              tokenSymbol: IDL.Text,
              tokenName: IDL.Text,
              buildingHash: IDL.Text,
              buildingType: IDL.Opt(IDL.Text),
              location: IDL.Opt(IDL.Text),
            })
          ),
          Err: IDL.Variant({
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            InternalError: IDL.Text,
            Conflict: IDL.Text,
          }),
        }),
      ],
      ['query']
    ),
    getBuilding: IDL.Func(
      [IDL.Text],
      [
        IDL.Variant({
          Ok: IDL.Record({
            ledgerCanisterId: IDL.Principal,
            deployedAt: IDL.Nat64,
            owner: IDL.Principal,
            metadata: IDL.Opt(IDL.Record({})),
            name: IDL.Text,
            uuid: IDL.Text,
            lastUpdated: IDL.Nat64,
            description: IDL.Text,
            version: IDL.Text,
            tokenSymbol: IDL.Text,
            tokenName: IDL.Text,
            buildingHash: IDL.Text,
            buildingType: IDL.Opt(IDL.Text),
            location: IDL.Opt(IDL.Text),
          }),
          Err: IDL.Variant({
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            InternalError: IDL.Text,
            Conflict: IDL.Text,
          }),
        }),
      ],
      ['query']
    ),
    getUserBuildings: IDL.Func(
      [IDL.Principal],
      [
        IDL.Variant({
          Ok: IDL.Vec(
            IDL.Record({
              ledgerCanisterId: IDL.Principal,
              deployedAt: IDL.Nat64,
              owner: IDL.Principal,
              metadata: IDL.Opt(IDL.Record({})),
              name: IDL.Text,
              uuid: IDL.Text,
              lastUpdated: IDL.Nat64,
              description: IDL.Text,
              version: IDL.Text,
              tokenSymbol: IDL.Text,
              tokenName: IDL.Text,
              buildingHash: IDL.Text,
              buildingType: IDL.Opt(IDL.Text),
              location: IDL.Opt(IDL.Text),
            })
          ),
          Err: IDL.Variant({
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            InternalError: IDL.Text,
            Conflict: IDL.Text,
          }),
        }),
      ],
      ['query']
    ),
    initializeCanister: IDL.Func(
      [IDL.Principal],
      [
        IDL.Variant({
          Ok: IDL.Record({
            id: IDL.Principal,
            createdAt: IDL.Nat64,
          }),
          Err: IDL.Variant({
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            InternalError: IDL.Text,
            Conflict: IDL.Text,
          }),
        }),
      ],
      []
    ),
    registerBuilding: IDL.Func(
      [
        IDL.Text,
        IDL.Principal,
        IDL.Principal,
        IDL.Text,
        IDL.Text,
        IDL.Text,
        IDL.Text,
      ],
      [
        IDL.Variant({
          Ok: IDL.Record({
            ledgerCanisterId: IDL.Principal,
            deployedAt: IDL.Nat64,
            owner: IDL.Principal,
            metadata: IDL.Opt(IDL.Record({})),
            name: IDL.Text,
            uuid: IDL.Text,
            lastUpdated: IDL.Nat64,
            description: IDL.Text,
            version: IDL.Text,
            tokenSymbol: IDL.Text,
            tokenName: IDL.Text,
            buildingHash: IDL.Text,
            buildingType: IDL.Opt(IDL.Text),
            location: IDL.Opt(IDL.Text),
          }),
          Err: IDL.Variant({
            NotFound: IDL.Text,
            ValidationError: IDL.Text,
            Unauthorized: IDL.Text,
            InternalError: IDL.Text,
            Conflict: IDL.Text,
          }),
        }),
      ],
      []
    ),
  });
};
export const init = ({ IDL }) => {
  return [];
};

export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addLog' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Reserved)],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'action' : IDL.Text,
              'data' : IDL.Opt(IDL.Reserved),
              'hash' : IDL.Text,
              'createdAt' : IDL.Nat64,
              'uuid' : IDL.Text,
              'serviceId' : IDL.Principal,
              'userFingerprint' : IDL.Text,
            }),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
    'getAllLogs' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'data' : IDL.Opt(IDL.Reserved),
                'hash' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'uuid' : IDL.Text,
                'serviceId' : IDL.Principal,
                'userFingerprint' : IDL.Text,
              })
            ),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogsByAction' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'data' : IDL.Opt(IDL.Reserved),
                'hash' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'uuid' : IDL.Text,
                'serviceId' : IDL.Principal,
                'userFingerprint' : IDL.Text,
              })
            ),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogsByUserFingerprint' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'data' : IDL.Opt(IDL.Reserved),
                'hash' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'uuid' : IDL.Text,
                'serviceId' : IDL.Principal,
                'userFingerprint' : IDL.Text,
              })
            ),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'getLogsByUuid' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(
              IDL.Record({
                'id' : IDL.Principal,
                'action' : IDL.Text,
                'data' : IDL.Opt(IDL.Reserved),
                'hash' : IDL.Text,
                'createdAt' : IDL.Nat64,
                'uuid' : IDL.Text,
                'serviceId' : IDL.Principal,
                'userFingerprint' : IDL.Text,
              })
            ),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        ['query'],
      ),
    'initializeCanister' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'id' : IDL.Principal,
              'createdAt' : IDL.Nat64,
            }),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
    'verifyLog' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({ 'valid' : IDL.Bool, 'hash' : IDL.Text }),
            'Err' : IDL.Variant({
              'NotFound' : IDL.Text,
              'ValidationError' : IDL.Text,
              'Unauthorized' : IDL.Text,
              'InternalError' : IDL.Text,
              'Conflict' : IDL.Text,
            }),
          }),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };

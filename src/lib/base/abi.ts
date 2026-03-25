export const AIR_HOCKEY_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
    ],
    name: 'GameCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'winner', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'player1Score', type: 'uint8' },
      { indexed: false, internalType: 'uint8', name: 'player2Score', type: 'uint8' },
    ],
    name: 'GameCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'string', name: 'roomCode', type: 'string' },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
    ],
    name: 'GameExpired',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'opponent', type: 'address' },
    ],
    name: 'GameJoined',
    type: 'event',
  },

  // Functions
  {
    inputs: [],
    name: 'GAME_EXPIRY',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'cancelGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'roomCode', type: 'string' }],
    name: 'createGame',
    outputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'expireGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'getGame',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address', name: 'opponent', type: 'address' },
          { internalType: 'enum AirHockey.GameStatus', name: 'status', type: 'uint8' },
          { internalType: 'address', name: 'winner', type: 'address' },
          { internalType: 'uint8', name: 'player1Score', type: 'uint8' },
          { internalType: 'uint8', name: 'player2Score', type: 'uint8' },
          { internalType: 'string', name: 'roomCode', type: 'string' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
        ],
        internalType: 'struct AirHockey.Game',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'roomCode', type: 'string' }],
    name: 'getGameByRoomCode',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'address', name: 'opponent', type: 'address' },
          { internalType: 'enum AirHockey.GameStatus', name: 'status', type: 'uint8' },
          { internalType: 'address', name: 'winner', type: 'address' },
          { internalType: 'uint8', name: 'player1Score', type: 'uint8' },
          { internalType: 'uint8', name: 'player2Score', type: 'uint8' },
          { internalType: 'string', name: 'roomCode', type: 'string' },
          { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
        ],
        internalType: 'struct AirHockey.Game',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'gamesPlayed', type: 'uint256' },
          { internalType: 'uint256', name: 'wins', type: 'uint256' },
          { internalType: 'uint256', name: 'losses', type: 'uint256' },
        ],
        internalType: 'struct AirHockey.PlayerStats',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'gameId', type: 'uint256' }],
    name: 'joinGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextGameId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'oracle',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOracle', type: 'address' }],
    name: 'setOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'gameId', type: 'uint256' },
      { internalType: 'uint8', name: 'p1Score', type: 'uint8' },
      { internalType: 'uint8', name: 'p2Score', type: 'uint8' },
    ],
    name: 'submitResult',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

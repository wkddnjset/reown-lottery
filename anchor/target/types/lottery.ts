/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lottery.json`.
 */
export type Lottery = {
  "address": "BT5phA3eNcKRAjgbjWbqAsXLffC61ivRL4xtrg7uFWVd",
  "metadata": {
    "name": "lottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimPrize",
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "lottery",
          "writable": true
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "rank",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeLottery",
      "discriminator": [
        113,
        199,
        243,
        247,
        73,
        217,
        33,
        11
      ],
      "accounts": [
        {
          "name": "lottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "drawTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "pickWinners",
      "discriminator": [
        39,
        147,
        187,
        136,
        182,
        157,
        144,
        130
      ],
      "accounts": [
        {
          "name": "lottery",
          "writable": true
        },
        {
          "name": "pool",
          "writable": true,
          "relations": [
            "lottery"
          ]
        },
        {
          "name": "dev",
          "writable": true,
          "relations": [
            "lottery"
          ]
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nextDrawTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "purchaseTickets",
      "discriminator": [
        146,
        121,
        85,
        207,
        182,
        70,
        169,
        155
      ],
      "accounts": [
        {
          "name": "lottery",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "dev",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "ticketNumbers",
          "type": {
            "vec": {
              "array": [
                "u8",
                4
              ]
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lottery",
      "discriminator": [
        162,
        182,
        26,
        12,
        164,
        214,
        112,
        3
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidNumber",
      "msg": "Invalid number in the ticket."
    },
    {
      "code": 6001,
      "name": "duplicateNumber",
      "msg": "Duplicate number found in the ticket."
    },
    {
      "code": 6002,
      "name": "purchaseNotAllowed",
      "msg": "Ticket purchase is not allowed at this time."
    },
    {
      "code": 6003,
      "name": "duplicateTicket",
      "msg": "Duplicate ticket is not allowed."
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Unauthorized access."
    },
    {
      "code": 6005,
      "name": "drawNotAllowed",
      "msg": "Draw is not allowed at this time."
    },
    {
      "code": 6006,
      "name": "invalidNextDrawTime",
      "msg": "Invalid next draw time."
    },
    {
      "code": 6007,
      "name": "overflow",
      "msg": "Overflow error."
    },
    {
      "code": 6008,
      "name": "insufficientFunds",
      "msg": "Insufficient funds."
    },
    {
      "code": 6009,
      "name": "alreadyClaimed",
      "msg": "Already claimed."
    },
    {
      "code": 6010,
      "name": "invalidDevAccount",
      "msg": "Invalid developer account."
    },
    {
      "code": 6011,
      "name": "invalidPoolAccount",
      "msg": "Invalid pool account."
    }
  ],
  "types": [
    {
      "name": "lottery",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tickets",
            "type": {
              "vec": {
                "defined": {
                  "name": "ticket"
                }
              }
            }
          },
          {
            "name": "currentRound",
            "type": "u64"
          },
          {
            "name": "drawTime",
            "type": "i64"
          },
          {
            "name": "pastRounds",
            "type": {
              "vec": {
                "defined": {
                  "name": "pastRound"
                }
              }
            }
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "dev",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "pastRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": {
              "vec": {
                "defined": {
                  "name": "winner"
                }
              }
            }
          },
          {
            "name": "winningNumbers",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          },
          {
            "name": "userTickets",
            "type": {
              "vec": {
                "defined": {
                  "name": "ticket"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "numbers",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "winner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "prize",
            "type": "u64"
          },
          {
            "name": "rank",
            "type": "u8"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};

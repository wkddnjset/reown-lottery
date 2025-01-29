/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lottery.json`.
 */
export type Lottery = {
  "address": "pZWobzWKfjoG9QkKXfYvYTjgBQSMRP6Trqc897nUzUa",
  "metadata": {
    "name": "lottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "drawWinners",
      "discriminator": [
        43,
        87,
        86,
        4,
        32,
        104,
        203,
        209
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
          "name": "dev",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
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
          }
        ]
      }
    }
  ]
};

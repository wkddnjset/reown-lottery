/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/lotto_program.json`.
 */
export type LottoProgram = {
  "address": "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF",
  "metadata": {
    "name": "lottoProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyTicket",
      "discriminator": [
        11,
        24,
        17,
        193,
        168,
        116,
        164,
        169
      ],
      "accounts": [
        {
          "name": "lottoAccount",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "timeSlot",
          "type": "string"
        }
      ]
    },
    {
      "name": "pickWinner",
      "discriminator": [
        227,
        62,
        25,
        73,
        132,
        106,
        68,
        96
      ],
      "accounts": [
        {
          "name": "lottoAccount",
          "writable": true
        },
        {
          "name": "winnerWallet",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "timeSlot",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lottoAccount",
      "discriminator": [
        190,
        243,
        29,
        116,
        218,
        13,
        234,
        238
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPurchaseTime",
      "msg": "Invalid purchase time."
    },
    {
      "code": 6001,
      "name": "invalidResultTime",
      "msg": "Invalid result time."
    },
    {
      "code": 6002,
      "name": "alreadyPurchased",
      "msg": "This address has already purchased a ticket."
    },
    {
      "code": 6003,
      "name": "noParticipants",
      "msg": "No participants in the lottery."
    }
  ],
  "types": [
    {
      "name": "lottoAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "purchasedAddresses",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "totalPot",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

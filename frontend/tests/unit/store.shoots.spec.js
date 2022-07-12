//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import {
  mapAccessRestrictionForInput
} from '@/store'

import getters from '@/store/modules/shoots/getters'
import { parseSearch } from '@/store/modules/shoots/helper'

describe('store.shoots.getters', () => {
  let shootItems
  const rootGetters = {
    ticketsLabels: undefined,
    shootCustomFields: {
      Z_Foo: {
        path: 'metadata.namespace'
      }
    },
    shootCustomFieldList: undefined,
    latestUpdatedTicketByNameAndNamespace: undefined
  }
  let state
  let sortItems

  beforeEach(() => {
    state = {}
    sortItems = getters.sortItems(state, undefined, undefined, rootGetters)

    shootItems = [
      {
        metadata: {
          name: 'shoot2',
          namespace: 'foo'
        },
        spec: {
          creationTimestamp: '2020-01-01T20:00:00Z',
          kubernetes: {
            version: '1.0.0'
          },
          region: 'region1',
          provider: {
            type: 'infra1'
          },
          purpose: 'development'
        },
        status: {
          lastOperation: {
            progress: 100,
            state: 'Succeeded'
          },
          conditions: [
            {
              status: 'True',
              lastTransitionTime: '2020-03-01T20:00:00Z'
            }
          ]
        }
      },
      {
        metadata: {
          name: 'shoot1',
          namespace: 'foo'
        },
        spec: {
          creationTimestamp: '2020-02-01T20:00:00Z',
          kubernetes: {
            version: '1.1.0'
          },
          region: 'region1',
          provider: {
            type: 'infra2'
          },
          purpose: 'production'
        },
        status: {
          lastOperation: {
            progress: 90,
            state: 'Succeeded'
          },
          conditions: [
            {
              status: 'False',
              lastTransitionTime: '2020-02-01T20:00:00Z'
            }
          ]
        }
      },
      {
        metadata: {
          name: 'shoot3',
          namespace: 'bar'
        },
        spec: {
          creationTimestamp: '2020-01-01T20:00:00Z',
          kubernetes: {
            version: '1.0.0'
          },
          region: 'region2',
          provider: {
            type: 'infra1'
          },
          purpose: 'development'
        },
        status: {
          lastOperation: {
            progress: 100,
            state: 'Succeeded'
          },
          lastErrors: [
            {
              description: 'bar'
            }
          ],
          conditions: [
            {
              status: 'False',
              lastTransitionTime: '2020-01-01T20:00:00Z'
            }
          ]
        }
      }
    ]
  })

  it('should sort shoots by name', () => {
    const sortBy = ['name']
    const sortDesc = [true]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot3')
    expect(sortedShoots[1].metadata.name).toBe('shoot2')
    expect(sortedShoots[2].metadata.name).toBe('shoot1')
  })

  it('should sort shoots by purpose', () => {
    const sortBy = ['purpose']
    const sortDesc = [true]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot2')
    expect(sortedShoots[1].metadata.name).toBe('shoot3')
    expect(sortedShoots[2].metadata.name).toBe('shoot1')
  })

  it('should sort shoots by creationTimestamp', () => {
    const sortBy = ['creationTimestamp']
    const sortDesc = [false]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot1')
    expect(sortedShoots[1].metadata.name).toBe('shoot2')
    expect(sortedShoots[2].metadata.name).toBe('shoot3')
  })

  it('should sort shoots by kubernetes version', () => {
    const sortBy = ['k8sVersion']
    const sortDesc = [false]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot2')
    expect(sortedShoots[1].metadata.name).toBe('shoot3')
    expect(sortedShoots[2].metadata.name).toBe('shoot1')
  })

  it('should sort shoots by infrastructure', () => {
    const sortBy = ['infrastructure']
    const sortDesc = [true]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot1')
    expect(sortedShoots[1].metadata.name).toBe('shoot3')
    expect(sortedShoots[2].metadata.name).toBe('shoot2')
  })

  it('should sort shoots by lastOperation (status)', () => {
    const sortBy = ['lastOperation']
    const sortDesc = [true]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot2')
    expect(sortedShoots[1].metadata.name).toBe('shoot1')
    expect(sortedShoots[2].metadata.name).toBe('shoot3')
  })

  it('should sort shoots by readiness', () => {
    const sortBy = ['readiness']
    const sortDesc = [false]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot3')
    expect(sortedShoots[1].metadata.name).toBe('shoot1')
    expect(sortedShoots[2].metadata.name).toBe('shoot2')
  })

  it('should sort shoots by readiness', () => {
    const sortBy = ['readiness']
    const sortDesc = [false]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot3')
    expect(sortedShoots[1].metadata.name).toBe('shoot1')
    expect(sortedShoots[2].metadata.name).toBe('shoot2')
  })

  it('should sort shoots by custom column', () => {
    const sortBy = ['Z_Foo']
    const sortDesc = [false]
    const sortedShoots = sortItems(shootItems, sortBy, sortDesc)

    expect(sortedShoots[0].metadata.name).toBe('shoot3')
    expect(sortedShoots[1].metadata.name).toBe('shoot1')
    expect(sortedShoots[2].metadata.name).toBe('shoot2')
  })

  it('should keep sorting static when shoot list is freezed', () => {
    const sortBy = ['name']
    const sortDesc = [false]
    let sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots[0].metadata.name).toBe('shoot1')

    state.freezeSorting = true
    sortedShoots[0].metadata.name = 'shoot4'
    sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots[0].metadata.name).toBe('shoot4')
  })

  it('should mark no longer existing shoots as stale when shoot list is freezed', () => {
    const sortBy = ['name']
    const sortDesc = [false]
    let sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots[0].stale).toBe(undefined)

    state.freezeSorting = true
    shootItems.splice(0,1)
    expect(shootItems.length).toBe(2)
    
    sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots.length).toBe(3)
    expect(sortedShoots[0].stale).toBe(true)
  })

  it('should not add new shoots to list when shoot list is freezed', () => {
    const sortBy = ['issueSince']
    const sortDesc = [false]
    let sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots.length).toBe(3)

    state.freezeSorting = true
    const newShoot = {
      ...shootItems[0]
    }
    shootItems.push(newShoot)
    newShoot.name = "shoot4"
    expect(shootItems.length).toBe(4)

    sortedShoots = sortItems(shootItems, sortBy, sortDesc)
    expect(sortedShoots.length).toBe(3)
  })
})

describe('store.AccessRestrictions', () => {
  let definition
  let shootResource

  beforeEach(() => {
    definition = {
      key: 'foo',
      input: {
        inverted: false
      },
      options: [
        {
          key: 'foo-option-1',
          input: {
            inverted: false
          }
        },
        {
          key: 'foo-option-2',
          input: {
            inverted: true
          }
        },
        {
          key: 'foo-option-3',
          input: {
            inverted: true
          }
        },
        {
          key: 'foo-option-4',
          input: {
            inverted: true
          }
        }
      ]
    }

    shootResource = {
      metadata: {
        annotations: {
          'foo-option-1': 'false',
          'foo-option-2': 'false',
          'foo-option-3': 'true'
        }
      },
      spec: {
        seedSelector: {
          matchLabels: {
            foo: 'true'
          }
        }
      }
    }
  })

  it('should map definition and shoot resources to access restriction data model', () => {
    const accessRestrictionPair = mapAccessRestrictionForInput(definition, shootResource)
    expect(accessRestrictionPair).toEqual([
      'foo',
      {
        value: true,
        options: {
          'foo-option-1': {
            value: false
          },
          'foo-option-2': {
            value: true // value inverted as defined in definition
          },
          'foo-option-3': {
            value: false // value inverted as defined in definition
          },
          'foo-option-4': {
            value: false // value not set in spec always maps to false
          }
        }
      }
    ])
  })

  it('should invert access restriction', () => {
    definition.input.inverted = true
    const [, accessRestriction] = mapAccessRestrictionForInput(definition, shootResource)
    expect(accessRestriction.value).toBe(false)
  })

  it('should not invert option', () => {
    definition.options[1].input.inverted = false
    const [, accessRestriction] = mapAccessRestrictionForInput(definition, shootResource)
    expect(accessRestriction.options['foo-option-2'].value).toBe(false)
  })

  it('should invert option', () => {
    definition.options[1].input.inverted = true
    const [, accessRestriction] = mapAccessRestrictionForInput(definition, shootResource)
    expect(accessRestriction.options['foo-option-2'].value).toBe(true)
  })
})

describe('store.shoots.helper', () => {
  describe('#parseSearch', () => {
    it('should parse search text', () => {
      const searchQuery = parseSearch('a "b""s" -"c" -d')
      expect(searchQuery.terms).toEqual([
        {
          exact: false,
          exclude: false,
          value: 'a'
        },
        {
          exact: true,
          exclude: false,
          value: 'b"s'
        },
        {
          exact: true,
          exclude: true,
          value: 'c'
        },
        {
          exact: false,
          exclude: true,
          value: 'd'
        }
      ])
    })

    it('should match values correctly', () => {
      const searchQuery = parseSearch('a "b""s" -"c" -d')
      expect(searchQuery.matches(['$a', 'b"s', '$c'])).toBe(true)
      expect(searchQuery.matches(['$a', 'b"s', '$d'])).toBe(false)
      expect(searchQuery.matches(['$a', 'b"s', 'c'])).toBe(false)
      expect(searchQuery.matches(['$a', '$b"s'])).toBe(false)
      expect(searchQuery.matches(['b"s'])).toBe(false)
    })
  })
})

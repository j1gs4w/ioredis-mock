import orderBy from 'lodash.orderby'

import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import {
  filterPredicate,
  getWithScoresAndLimit,
  offsetAndLimit,
  parseLimit,
} from './zrange-command.common'

export function zrangebyscore(key, inputMin, inputMax, ...args) {
  const map = this.data.get(key)
  if (!map) {
    return []
  }

  if (this.data.has(key) && !(this.data.get(key) instanceof Map)) {
    return []
  }

  const { withScores, limit, offset } = getWithScoresAndLimit(args)

  const min = parseLimit(inputMin)
  const max = parseLimit(inputMax)
  const filteredArray = Array.from(map.values()).filter(
    filterPredicate(min, max)
  )

  let ordered = orderBy(filteredArray, ['score', 'value'])
  if (withScores) {
    if (limit !== null) {
      ordered = offsetAndLimit(ordered, offset, limit)
    }

    return ordered.flatMap(it => [it.value, it.score])
  }

  const results = ordered.map(it => it.value)
  if (limit !== null) {
    return offsetAndLimit(results, offset, limit)
  }
  return results
}

export function zrangebyscoreBuffer(...args) {
  const val = zrangebyscore.apply(this, args)
  return convertStringToBuffer(val)
}

import type { SparkieApi } from '../../shared/types'

declare global {
  interface Window {
    sparkie: SparkieApi
  }
}

export {}

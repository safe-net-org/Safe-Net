/**
 * Prints the drift-prone detection data as JSON on stdout.
 *
 * The rule engine is TypeScript; the ML service re-implements the same rules in
 * Python and must use the same brand list and homoglyph map. Those two lists
 * have drifted before (paypal missing from the Python side, the confusables map
 * out of sync), each time producing a detector that disagreed with itself
 * across languages. This dump is the source half of a parity check:
 * `ml-service/scripts/test_parity.py` reads it and asserts the Python constants
 * match, failing CI on any drift.
 *
 *   bunx tsx scripts/dump-detection-data.ts
 */
import { CYRILLIC_TO_LATIN_MAP, TOP_RU_BRANDS } from '../src/shared/brands'

const data = {
	brands: [...TOP_RU_BRANDS].sort(),
	confusables: CYRILLIC_TO_LATIN_MAP,
}

process.stdout.write(JSON.stringify(data))

import { BigNumber } from "bignumber.js";

// Uplocoin -> hastings unit conversion functions
// These make conversion between units of Uplo easy and consistent for developers.
// Never return exponentials from BigNumber.toString, since they confuse the API
BigNumber.config({ EXPONENTIAL_AT: 1e9 });
BigNumber.config({ DECIMAL_PLACES: 30 });

// Hastings is the lowest divisible unit in Uplo. This constant will be used to
// calculate the conversion between the base unit to human readable values.
const hastingsPerUplocoin = new BigNumber("10").exponentiatedBy(24);

export function toUplocoins(hastings: BigNumber | number | string) {
  return new BigNumber(hastings).dividedBy(hastingsPerUplocoin);
}

export function toHastings(uplocoins: BigNumber | number | string) {
  return new BigNumber(uplocoins).times(hastingsPerUplocoin);
}

/**
 * Converts hastings amount into human readable format.
 * This is copy of HumanString function from Uplo repo.
 * @param hastings amount of hastings to convert
 */
export function toHumanReadable(hastings: BigNumber | number | string): string {
  const pico = new BigNumber(1e12);
  const exp = new BigNumber(1e3);
  const amount = new BigNumber(hastings);

  if (amount.dividedBy(pico).isLessThan(1)) {
    return `${amount} H`;
  }

  const suffixes = ["pS", "nS", "uS", "mS", "SC", "KS", "MS", "GS", "TS"];

  for (let index = 0; index < suffixes.length; index++) {
    const mag = Array(index)
      .fill(null)
      .reduce((acc) => acc.multipliedBy(exp), new BigNumber(1));
    const reduced = amount.dividedBy(pico.multipliedBy(mag));
    if (reduced.isLessThan(exp) || index === suffixes.length - 1) {
      return `${reduced.decimalPlaces(3)} ${suffixes[index]}`;
    }
  }

  return null;
}

export interface AmountCalculation {
  amountMinor: number | null;
  error: string | null;
  isExpression: boolean;
}

interface Fraction {
  n: bigint;
  d: bigint;
}

// Constructor syntax also works when TS targets pre-ES2020 JavaScript.
// Runtime support for BigInt is required.
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const HUNDRED = BigInt(100);

export function evaluateAmount(input: string): AmountCalculation {
  const source = input
    .replace(/\u2212/g, '-')
    .replace(/\u00d7/g, '*')
    .replace(/\u00f7/g, '/');
  const isExpression = /[+*/()-]/.test(source);

  const fail = (error: string | null): AmountCalculation => ({
    amountMinor: null,
    error,
    isExpression,
  });

  if (!source.trim()) return fail(null);
  if (source.length > 120) return fail('Use a shorter calculation.');
  if (/[^0-9+\-*/().\s]/.test(source)) {
    return fail('Use numbers, a decimal point, +, −, ×, ÷, or parentheses.');
  }

  let position = 0;
  const skip = () => {
    while (/\s/.test(source[position] ?? '') && position < source.length) {
      position += 1;
    }
  };

  const take = (token: string): boolean => {
    skip();
    if (source[position] !== token) return false;
    position += 1;
    return true;
  };

  function primary(): Fraction {
    skip();

    if (take('+')) return primary();
    if (take('-')) {
      const value = primary();
      return { n: -value.n, d: value.d };
    }

    if (take('(')) {
      const value = expression();
      if (!take(')')) throw new Error('Close the parentheses.');
      return value;
    }

    skip();
    const match = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(source.slice(position));
    if (!match) throw new Error('Complete the calculation.');

    position += match[0].length;
    const [whole, decimals = ''] = match[0].split('.');
    return {
      n: BigInt((whole || '0') + decimals),
      d: BigInt('1' + '0'.repeat(decimals.length)),
    };
  }

  function term(): Fraction {
    let left = primary();

    while (true) {
      if (take('*')) {
        const right = primary();
        left = { n: left.n * right.n, d: left.d * right.d };
      } else if (take('/')) {
        const right = primary();
        if (right.n === ZERO) throw new Error('Cannot divide by zero.');

        left = { n: left.n * right.d, d: left.d * right.n };
        if (left.d < ZERO) left = { n: -left.n, d: -left.d };
      } else {
        return left;
      }
    }
  }

  function expression(): Fraction {
    let left = term();

    while (true) {
      if (take('+')) {
        const right = term();
        left = {
          n: left.n * right.d + right.n * left.d,
          d: left.d * right.d,
        };
      } else if (take('-')) {
        const right = term();
        left = {
          n: left.n * right.d - right.n * left.d,
          d: left.d * right.d,
        };
      } else {
        return left;
      }
    }
  }

  try {
    const value = expression();
    skip();

    if (position !== source.length) {
      throw new Error('Check the calculation. Put an operator between numbers.');
    }
    if (value.n <= ZERO) {
      throw new Error('Amount must be greater than zero.');
    }

    // Match the app's existing 100-minor-units-per-major-unit model.
    // Round the final positive result, not intermediate calculations.
    const minor = (value.n * HUNDRED * TWO + value.d) / (value.d * TWO);

    if (minor < ONE) {
      throw new Error('Amount rounds to zero. Enter a larger amount.');
    }
    if (minor > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('Amount is too large.');
    }

    return { amountMinor: Number(minor), error: null, isExpression };
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Check the calculation.'
    );
  }
}

export class StringConvertFactory {
  private converterMap: Map<string, StringConverter> = new Map();

  constructor() {}

  /**
   * Create a string converter based on the given type.
   *
   * @param type - The type of case to convert to.
   * @returns
   */
  createConverter(type: string): StringConverter | undefined {
    switch (type) {
      case "lowerCamel":
        return new LowerCamelCaseConverter();
      case "upperCamel":
        return new UpperCamelCaseConverter();
      case "snake":
        return new SnakeCaseConverter();
      case "const":
        return new ConstantCaseConverter();
      case "kebab":
        return new KebabCaseConverter();
      case "pythonMagicMethods":
        return new PythonMagicMethodsConverter();
      case "pythonNameMangling":
        return new PythonNameManglingConverter();
      default:
        return undefined;
    }
  }

  /**
   * get a string converter from the cache or create a new one if it doesn't exist.
   *
   * @param type - The type of case to get.
   * @returns
   */
  getConverter(type: string): StringConverter | undefined {
    let converter = this.converterMap.get(type);
    if (!converter) {
      converter = this.createConverter(type);
      if (converter) {
        this.converterMap.set(type, converter);
      }
    }
    return converter;
  }

  /**
   * special convert before standard convert
   *
   * such as:
   * - remove python special characters
   * - common abbreviations // TODO: implement this
   */
  private specialConvert(input: string) {
    new RemovePythonSpecialCharsConverter().convert(input);
  }

  /**
   * Get all cases of the input string.
   *
   * @returns An array of strings representing different cases of the input string.
   */
  public getAllCases(input: string, converterList: string[]): string[] {
    this.specialConvert(input);
    const converters: StringConverter[] = [];
    converterList.forEach((converterTypeName) => {
      const converter = this.getConverter(converterTypeName);
      if (converter) {
        converters.push(converter);
      }
    });
    return converters.map((converter) => converter.convert(input));
  }
}

/**
 * Interface for string converters.
 * A string converter is used to convert a given input string to a specific format.
 */
interface StringConverter {
  /**
   * Convert the input string to a specific format.
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string.
   */
  convert(input: string): string;
}

class RemovePythonSpecialCharsConverter implements StringConverter {
  /**
   * Remove Python special characters from the input string.
   *
   * eg: __ aaBbCc__ to AaBbCc or _AaBbCc to AaBbCc
   *
   * @param inputString - The input string to be processed.
   * @returns The processed string with Python special characters removed.
   */
  convert(input: string): string {
    if (input.startsWith("__") && input.endsWith("__")) {
      return input.slice(2, -2);
    } else if (input.startsWith("_")) {
      return input.slice(1);
    }
    return input;
  }
}

class CapitalizeFirstLetterConverter implements StringConverter {
  /**
   * aaaaa -> Aaaaa
   *
   * @param inputString - The input string to be capitalized.
   * @returns The capitalized string.
   */
  convert(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}

class LowerCamelCaseConverter implements StringConverter {
  /**
   * AaBbCc -> aaBbCc
   *
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in lower camel case.
   */
  convert(input: string): string {
    // Remove extra spaces
    input = input.trim().replace(/\s+/g, " ");
    input = input.replace(" ", "0");
    // Check if it's already camel case
    if (input.match(/[a-z][A-Z]/)) {
      return input;
    }
    if (input.includes("-")) {
      input = input.toLowerCase().replace(/-/g, "0");
    }
    if (input.includes("_")) {
      input = input.toLowerCase().replace(/_/g, "0");
    }
    const words = input.split(/[^a-zA-Z0-9]/);
    const camelCaseWords = words.map((word) => {
      if (word.length === 0) {
        return word.toLowerCase();
      }
      return new CapitalizeFirstLetterConverter().convert(word.toLowerCase());
    });
    return camelCaseWords.join("");
  }
}

class UpperCamelCaseConverter implements StringConverter {
  /**
   * aaBbCc -> AaBbCc
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in upper camel case.
   */
  convert(input: string): string {
    const lowerCamelCase = new LowerCamelCaseConverter().convert(input);
    return lowerCamelCase.charAt(0).toUpperCase() + lowerCamelCase.slice(1);
  }
}

class SnakeCaseConverter implements StringConverter {
  /**
   * AaBbCc -> aa_bb_cc
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in snake case.
   */
  convert(input: string): string {
    return input.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  }
}

class ConstantCaseConverter implements StringConverter {
  /**
   * AaBbCc -> AA_BB_CC
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in constant case.
   */
  convert(input: string): string {
    const snakeCase = new SnakeCaseConverter().convert(input);
    return snakeCase.toUpperCase();
  }
}

class KebabCaseConverter implements StringConverter {
  /**
   * AaBbCc -> aa-bb-cc
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in kebab case.
   */
  convert(input: string): string {
    const kebabCase = input
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase();
    return kebabCase;
  }
}

class PythonMagicMethodsConverter implements StringConverter {
  /**
   * AaBbCc -> __aa_bb_cc__
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in Python magic methods format.
   */
  convert(input: string): string {
    const lowerCamelCase = new LowerCamelCaseConverter().convert(input);
    return `__${lowerCamelCase}__`;
  }
}

class PythonNameManglingConverter implements StringConverter {
  /**
   * AaBbCc -> _AaBbCc
   *
   * @param inputString - The input string to be converted.
   * @returns The converted string in Python name mangling format.
   */
  convert(input: string): string {
    const lowerCamelCase = new LowerCamelCaseConverter().convert(input);
    return `_${lowerCamelCase}`;
  }
}

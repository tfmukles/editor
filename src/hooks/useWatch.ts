export function deepEqual(a: any, b: any) {
  // If the values are strictly equal, return true
  if (a === b) return true;

  // If the values are not objects or one of them is null, return false
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  // Get the keys of both objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // If the number of keys is different, the objects are not equal
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Iterate over the keys of object a
  for (const key of keysA) {
    // If the current key is not present in object b, the objects are not equal
    if (!b.hasOwnProperty(key)) {
      return false;
    }

    // Recursively compare the values of the current key
    if (!deepEqual(a[key], b[key])) return false;
  }

  // If we made it this far, the objects are equal
  return true;
}

export function useWatchStateChange(prev: any, curr: any) {
  return deepEqual({ name: "Mokles" }, { name: "Mokles" });
}

export function removeValueFromArray<T>(array: T[], excludedValue: T): T[] {
  const index = array.indexOf(excludedValue);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

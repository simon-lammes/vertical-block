export interface Serializable {
  /**
   * This method straps all methods from an object so that it can be saved in Firebase.
   * In the comments of a [pull request on GitHub]{@link https://github.com/firebase/firebase-js-sdk/issues/311}
   * the reason for this necessity is explained. Furthermore, there is hope that this serialization will not be
   * required one day.
   */
  serialize(): any;
}

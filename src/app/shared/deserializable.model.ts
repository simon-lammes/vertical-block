export interface Deserializable {
  /**
   * This method can be used on newly instantiated classes to instantiate their properties
   * with input data coming from the backend. You might ask: Why not directly parse the provided data into an object?
   * The answer is: The provided data does not contain any instance methods and therefore the resulting object would
   * also have no instance methods. Our solution is first creating the object with the regular constructor, thereby
   * initializing all its methods, and afterwards initializing the properties with this method.
   * @param input the input data containing the property values for this object (usually coming from a backend)
   */
  deserialize(input: any): this;
}

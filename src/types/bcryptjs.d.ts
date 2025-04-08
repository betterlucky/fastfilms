declare module 'bcryptjs' {
  /**
   * Generate a salt synchronously
   * @param {number} [rounds] - Number of rounds to use, defaults to 10 if omitted
   * @returns {string} Resulting salt
   */
  export function genSaltSync(rounds?: number): string

  /**
   * Generate a salt asynchronously
   * @param {number} [rounds] - Number of rounds to use, defaults to 10 if omitted
   * @returns {Promise<string>} Resulting salt
   */
  export function genSalt(rounds?: number): Promise<string>

  /**
   * Hash a string synchronously
   * @param {string} s - String to hash
   * @param {string|number} salt - Salt length to generate or salt to use
   * @returns {string} Resulting hash
   */
  export function hashSync(s: string, salt: string | number): string

  /**
   * Hash a string asynchronously
   * @param {string} s - String to hash
   * @param {string|number} salt - Salt length to generate or salt to use
   * @returns {Promise<string>} Resulting hash
   */
  export function hash(s: string, salt: string | number): Promise<string>

  /**
   * Compare a string to a hash synchronously
   * @param {string} s - String to compare
   * @param {string} hash - Hash to compare to
   * @returns {boolean} true if matching, false otherwise
   */
  export function compareSync(s: string, hash: string): boolean

  /**
   * Compare a string to a hash asynchronously
   * @param {string} s - String to compare
   * @param {string} hash - Hash to compare to
   * @returns {Promise<boolean>} true if matching, false otherwise
   */
  export function compare(s: string, hash: string): Promise<boolean>

  /**
   * Gets the number of rounds used to encrypt a hash
   * @param {string} hash - Hash to get the number of rounds from
   * @returns {number} number of rounds
   */
  export function getRounds(hash: string): number
}

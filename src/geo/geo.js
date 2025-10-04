/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const mihomo = $root.mihomo = (() => {

    /**
     * Namespace mihomo.
     * @exports mihomo
     * @namespace
     */
    const mihomo = {};

    mihomo.component = (function() {

        /**
         * Namespace component.
         * @memberof mihomo
         * @namespace
         */
        const component = {};

        component.geodata = (function() {

            /**
             * Namespace geodata.
             * @memberof mihomo.component
             * @namespace
             */
            const geodata = {};

            geodata.router = (function() {

                /**
                 * Namespace router.
                 * @memberof mihomo.component.geodata
                 * @namespace
                 */
                const router = {};

                router.Domain = (function() {

                    /**
                     * Properties of a Domain.
                     * @memberof mihomo.component.geodata.router
                     * @interface IDomain
                     * @property {mihomo.component.geodata.router.Domain.Type|null} [type] Domain type
                     * @property {string|null} [value] Domain value
                     * @property {Array.<mihomo.component.geodata.router.Domain.IAttribute>|null} [attribute] Domain attribute
                     */

                    /**
                     * Constructs a new Domain.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a Domain.
                     * @implements IDomain
                     * @constructor
                     * @param {mihomo.component.geodata.router.IDomain=} [properties] Properties to set
                     */
                    function Domain(properties) {
                        this.attribute = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Domain type.
                     * @member {mihomo.component.geodata.router.Domain.Type} type
                     * @memberof mihomo.component.geodata.router.Domain
                     * @instance
                     */
                    Domain.prototype.type = 0;

                    /**
                     * Domain value.
                     * @member {string} value
                     * @memberof mihomo.component.geodata.router.Domain
                     * @instance
                     */
                    Domain.prototype.value = "";

                    /**
                     * Domain attribute.
                     * @member {Array.<mihomo.component.geodata.router.Domain.IAttribute>} attribute
                     * @memberof mihomo.component.geodata.router.Domain
                     * @instance
                     */
                    Domain.prototype.attribute = $util.emptyArray;

                    /**
                     * Creates a new Domain instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {mihomo.component.geodata.router.IDomain=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.Domain} Domain instance
                     */
                    Domain.create = function create(properties) {
                        return new Domain(properties);
                    };

                    /**
                     * Encodes the specified Domain message. Does not implicitly {@link mihomo.component.geodata.router.Domain.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {mihomo.component.geodata.router.IDomain} message Domain message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Domain.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                            writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
                        if (message.attribute != null && message.attribute.length)
                            for (let i = 0; i < message.attribute.length; ++i)
                                $root.mihomo.component.geodata.router.Domain.Attribute.encode(message.attribute[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Domain message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.Domain.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {mihomo.component.geodata.router.IDomain} message Domain message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Domain.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Domain message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.Domain} Domain
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Domain.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.Domain();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.type = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.value = reader.string();
                                    break;
                                }
                            case 3: {
                                    if (!(message.attribute && message.attribute.length))
                                        message.attribute = [];
                                    message.attribute.push($root.mihomo.component.geodata.router.Domain.Attribute.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Domain message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.Domain} Domain
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Domain.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Domain message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Domain.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            switch (message.type) {
                            default:
                                return "type: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                                break;
                            }
                        if (message.value != null && message.hasOwnProperty("value"))
                            if (!$util.isString(message.value))
                                return "value: string expected";
                        if (message.attribute != null && message.hasOwnProperty("attribute")) {
                            if (!Array.isArray(message.attribute))
                                return "attribute: array expected";
                            for (let i = 0; i < message.attribute.length; ++i) {
                                let error = $root.mihomo.component.geodata.router.Domain.Attribute.verify(message.attribute[i]);
                                if (error)
                                    return "attribute." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a Domain message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.Domain} Domain
                     */
                    Domain.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.Domain)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.Domain();
                        switch (object.type) {
                        default:
                            if (typeof object.type === "number") {
                                message.type = object.type;
                                break;
                            }
                            break;
                        case "Plain":
                        case 0:
                            message.type = 0;
                            break;
                        case "Regex":
                        case 1:
                            message.type = 1;
                            break;
                        case "Domain":
                        case 2:
                            message.type = 2;
                            break;
                        case "Full":
                        case 3:
                            message.type = 3;
                            break;
                        }
                        if (object.value != null)
                            message.value = String(object.value);
                        if (object.attribute) {
                            if (!Array.isArray(object.attribute))
                                throw TypeError(".mihomo.component.geodata.router.Domain.attribute: array expected");
                            message.attribute = [];
                            for (let i = 0; i < object.attribute.length; ++i) {
                                if (typeof object.attribute[i] !== "object")
                                    throw TypeError(".mihomo.component.geodata.router.Domain.attribute: object expected");
                                message.attribute[i] = $root.mihomo.component.geodata.router.Domain.Attribute.fromObject(object.attribute[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Domain message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {mihomo.component.geodata.router.Domain} message Domain
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Domain.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.attribute = [];
                        if (options.defaults) {
                            object.type = options.enums === String ? "Plain" : 0;
                            object.value = "";
                        }
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = options.enums === String ? $root.mihomo.component.geodata.router.Domain.Type[message.type] === undefined ? message.type : $root.mihomo.component.geodata.router.Domain.Type[message.type] : message.type;
                        if (message.value != null && message.hasOwnProperty("value"))
                            object.value = message.value;
                        if (message.attribute && message.attribute.length) {
                            object.attribute = [];
                            for (let j = 0; j < message.attribute.length; ++j)
                                object.attribute[j] = $root.mihomo.component.geodata.router.Domain.Attribute.toObject(message.attribute[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this Domain to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.Domain
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Domain.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Domain
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.Domain
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Domain.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.Domain";
                    };

                    /**
                     * Type enum.
                     * @name mihomo.component.geodata.router.Domain.Type
                     * @enum {number}
                     * @property {number} Plain=0 Plain value
                     * @property {number} Regex=1 Regex value
                     * @property {number} Domain=2 Domain value
                     * @property {number} Full=3 Full value
                     */
                    Domain.Type = (function() {
                        const valuesById = {}, values = Object.create(valuesById);
                        values[valuesById[0] = "Plain"] = 0;
                        values[valuesById[1] = "Regex"] = 1;
                        values[valuesById[2] = "Domain"] = 2;
                        values[valuesById[3] = "Full"] = 3;
                        return values;
                    })();

                    Domain.Attribute = (function() {

                        /**
                         * Properties of an Attribute.
                         * @memberof mihomo.component.geodata.router.Domain
                         * @interface IAttribute
                         * @property {string|null} [key] Attribute key
                         * @property {boolean|null} [boolValue] Attribute boolValue
                         * @property {number|Long|null} [intValue] Attribute intValue
                         */

                        /**
                         * Constructs a new Attribute.
                         * @memberof mihomo.component.geodata.router.Domain
                         * @classdesc Represents an Attribute.
                         * @implements IAttribute
                         * @constructor
                         * @param {mihomo.component.geodata.router.Domain.IAttribute=} [properties] Properties to set
                         */
                        function Attribute(properties) {
                            if (properties)
                                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                    if (properties[keys[i]] != null)
                                        this[keys[i]] = properties[keys[i]];
                        }

                        /**
                         * Attribute key.
                         * @member {string} key
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @instance
                         */
                        Attribute.prototype.key = "";

                        /**
                         * Attribute boolValue.
                         * @member {boolean|null|undefined} boolValue
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @instance
                         */
                        Attribute.prototype.boolValue = null;

                        /**
                         * Attribute intValue.
                         * @member {number|Long|null|undefined} intValue
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @instance
                         */
                        Attribute.prototype.intValue = null;

                        // OneOf field names bound to virtual getters and setters
                        let $oneOfFields;

                        /**
                         * Attribute typedValue.
                         * @member {"boolValue"|"intValue"|undefined} typedValue
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @instance
                         */
                        Object.defineProperty(Attribute.prototype, "typedValue", {
                            get: $util.oneOfGetter($oneOfFields = ["boolValue", "intValue"]),
                            set: $util.oneOfSetter($oneOfFields)
                        });

                        /**
                         * Creates a new Attribute instance using the specified properties.
                         * @function create
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {mihomo.component.geodata.router.Domain.IAttribute=} [properties] Properties to set
                         * @returns {mihomo.component.geodata.router.Domain.Attribute} Attribute instance
                         */
                        Attribute.create = function create(properties) {
                            return new Attribute(properties);
                        };

                        /**
                         * Encodes the specified Attribute message. Does not implicitly {@link mihomo.component.geodata.router.Domain.Attribute.verify|verify} messages.
                         * @function encode
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {mihomo.component.geodata.router.Domain.IAttribute} message Attribute message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Attribute.encode = function encode(message, writer) {
                            if (!writer)
                                writer = $Writer.create();
                            if (message.key != null && Object.hasOwnProperty.call(message, "key"))
                                writer.uint32(/* id 1, wireType 2 =*/10).string(message.key);
                            if (message.boolValue != null && Object.hasOwnProperty.call(message, "boolValue"))
                                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boolValue);
                            if (message.intValue != null && Object.hasOwnProperty.call(message, "intValue"))
                                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.intValue);
                            return writer;
                        };

                        /**
                         * Encodes the specified Attribute message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.Domain.Attribute.verify|verify} messages.
                         * @function encodeDelimited
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {mihomo.component.geodata.router.Domain.IAttribute} message Attribute message or plain object to encode
                         * @param {$protobuf.Writer} [writer] Writer to encode to
                         * @returns {$protobuf.Writer} Writer
                         */
                        Attribute.encodeDelimited = function encodeDelimited(message, writer) {
                            return this.encode(message, writer).ldelim();
                        };

                        /**
                         * Decodes an Attribute message from the specified reader or buffer.
                         * @function decode
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @param {number} [length] Message length if known beforehand
                         * @returns {mihomo.component.geodata.router.Domain.Attribute} Attribute
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Attribute.decode = function decode(reader, length, error) {
                            if (!(reader instanceof $Reader))
                                reader = $Reader.create(reader);
                            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.Domain.Attribute();
                            while (reader.pos < end) {
                                let tag = reader.uint32();
                                if (tag === error)
                                    break;
                                switch (tag >>> 3) {
                                case 1: {
                                        message.key = reader.string();
                                        break;
                                    }
                                case 2: {
                                        message.boolValue = reader.bool();
                                        break;
                                    }
                                case 3: {
                                        message.intValue = reader.int64();
                                        break;
                                    }
                                default:
                                    reader.skipType(tag & 7);
                                    break;
                                }
                            }
                            return message;
                        };

                        /**
                         * Decodes an Attribute message from the specified reader or buffer, length delimited.
                         * @function decodeDelimited
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                         * @returns {mihomo.component.geodata.router.Domain.Attribute} Attribute
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        Attribute.decodeDelimited = function decodeDelimited(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
                        };

                        /**
                         * Verifies an Attribute message.
                         * @function verify
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {Object.<string,*>} message Plain object to verify
                         * @returns {string|null} `null` if valid, otherwise the reason why it is not
                         */
                        Attribute.verify = function verify(message) {
                            if (typeof message !== "object" || message === null)
                                return "object expected";
                            let properties = {};
                            if (message.key != null && message.hasOwnProperty("key"))
                                if (!$util.isString(message.key))
                                    return "key: string expected";
                            if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                                properties.typedValue = 1;
                                if (typeof message.boolValue !== "boolean")
                                    return "boolValue: boolean expected";
                            }
                            if (message.intValue != null && message.hasOwnProperty("intValue")) {
                                if (properties.typedValue === 1)
                                    return "typedValue: multiple values";
                                properties.typedValue = 1;
                                if (!$util.isInteger(message.intValue) && !(message.intValue && $util.isInteger(message.intValue.low) && $util.isInteger(message.intValue.high)))
                                    return "intValue: integer|Long expected";
                            }
                            return null;
                        };

                        /**
                         * Creates an Attribute message from a plain object. Also converts values to their respective internal types.
                         * @function fromObject
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {Object.<string,*>} object Plain object
                         * @returns {mihomo.component.geodata.router.Domain.Attribute} Attribute
                         */
                        Attribute.fromObject = function fromObject(object) {
                            if (object instanceof $root.mihomo.component.geodata.router.Domain.Attribute)
                                return object;
                            let message = new $root.mihomo.component.geodata.router.Domain.Attribute();
                            if (object.key != null)
                                message.key = String(object.key);
                            if (object.boolValue != null)
                                message.boolValue = Boolean(object.boolValue);
                            if (object.intValue != null)
                                if ($util.Long)
                                    (message.intValue = $util.Long.fromValue(object.intValue)).unsigned = false;
                                else if (typeof object.intValue === "string")
                                    message.intValue = parseInt(object.intValue, 10);
                                else if (typeof object.intValue === "number")
                                    message.intValue = object.intValue;
                                else if (typeof object.intValue === "object")
                                    message.intValue = new $util.LongBits(object.intValue.low >>> 0, object.intValue.high >>> 0).toNumber();
                            return message;
                        };

                        /**
                         * Creates a plain object from an Attribute message. Also converts values to other types if specified.
                         * @function toObject
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {mihomo.component.geodata.router.Domain.Attribute} message Attribute
                         * @param {$protobuf.IConversionOptions} [options] Conversion options
                         * @returns {Object.<string,*>} Plain object
                         */
                        Attribute.toObject = function toObject(message, options) {
                            if (!options)
                                options = {};
                            let object = {};
                            if (options.defaults)
                                object.key = "";
                            if (message.key != null && message.hasOwnProperty("key"))
                                object.key = message.key;
                            if (message.boolValue != null && message.hasOwnProperty("boolValue")) {
                                object.boolValue = message.boolValue;
                                if (options.oneofs)
                                    object.typedValue = "boolValue";
                            }
                            if (message.intValue != null && message.hasOwnProperty("intValue")) {
                                if (typeof message.intValue === "number")
                                    object.intValue = options.longs === String ? String(message.intValue) : message.intValue;
                                else
                                    object.intValue = options.longs === String ? $util.Long.prototype.toString.call(message.intValue) : options.longs === Number ? new $util.LongBits(message.intValue.low >>> 0, message.intValue.high >>> 0).toNumber() : message.intValue;
                                if (options.oneofs)
                                    object.typedValue = "intValue";
                            }
                            return object;
                        };

                        /**
                         * Converts this Attribute to JSON.
                         * @function toJSON
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @instance
                         * @returns {Object.<string,*>} JSON object
                         */
                        Attribute.prototype.toJSON = function toJSON() {
                            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                        };

                        /**
                         * Gets the default type url for Attribute
                         * @function getTypeUrl
                         * @memberof mihomo.component.geodata.router.Domain.Attribute
                         * @static
                         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns {string} The default type url
                         */
                        Attribute.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                            if (typeUrlPrefix === undefined) {
                                typeUrlPrefix = "type.googleapis.com";
                            }
                            return typeUrlPrefix + "/mihomo.component.geodata.router.Domain.Attribute";
                        };

                        return Attribute;
                    })();

                    return Domain;
                })();

                router.CIDR = (function() {

                    /**
                     * Properties of a CIDR.
                     * @memberof mihomo.component.geodata.router
                     * @interface ICIDR
                     * @property {Uint8Array|null} [ip] CIDR ip
                     * @property {number|null} [prefix] CIDR prefix
                     */

                    /**
                     * Constructs a new CIDR.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a CIDR.
                     * @implements ICIDR
                     * @constructor
                     * @param {mihomo.component.geodata.router.ICIDR=} [properties] Properties to set
                     */
                    function CIDR(properties) {
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * CIDR ip.
                     * @member {Uint8Array} ip
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @instance
                     */
                    CIDR.prototype.ip = $util.newBuffer([]);

                    /**
                     * CIDR prefix.
                     * @member {number} prefix
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @instance
                     */
                    CIDR.prototype.prefix = 0;

                    /**
                     * Creates a new CIDR instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {mihomo.component.geodata.router.ICIDR=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.CIDR} CIDR instance
                     */
                    CIDR.create = function create(properties) {
                        return new CIDR(properties);
                    };

                    /**
                     * Encodes the specified CIDR message. Does not implicitly {@link mihomo.component.geodata.router.CIDR.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {mihomo.component.geodata.router.ICIDR} message CIDR message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    CIDR.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.ip != null && Object.hasOwnProperty.call(message, "ip"))
                            writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ip);
                        if (message.prefix != null && Object.hasOwnProperty.call(message, "prefix"))
                            writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.prefix);
                        return writer;
                    };

                    /**
                     * Encodes the specified CIDR message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.CIDR.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {mihomo.component.geodata.router.ICIDR} message CIDR message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    CIDR.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a CIDR message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.CIDR} CIDR
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    CIDR.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.CIDR();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.ip = reader.bytes();
                                    break;
                                }
                            case 2: {
                                    message.prefix = reader.uint32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a CIDR message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.CIDR} CIDR
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    CIDR.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a CIDR message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    CIDR.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.ip != null && message.hasOwnProperty("ip"))
                            if (!(message.ip && typeof message.ip.length === "number" || $util.isString(message.ip)))
                                return "ip: buffer expected";
                        if (message.prefix != null && message.hasOwnProperty("prefix"))
                            if (!$util.isInteger(message.prefix))
                                return "prefix: integer expected";
                        return null;
                    };

                    /**
                     * Creates a CIDR message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.CIDR} CIDR
                     */
                    CIDR.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.CIDR)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.CIDR();
                        if (object.ip != null)
                            if (typeof object.ip === "string")
                                $util.base64.decode(object.ip, message.ip = $util.newBuffer($util.base64.length(object.ip)), 0);
                            else if (object.ip.length >= 0)
                                message.ip = object.ip;
                        if (object.prefix != null)
                            message.prefix = object.prefix >>> 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from a CIDR message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {mihomo.component.geodata.router.CIDR} message CIDR
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    CIDR.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.defaults) {
                            if (options.bytes === String)
                                object.ip = "";
                            else {
                                object.ip = [];
                                if (options.bytes !== Array)
                                    object.ip = $util.newBuffer(object.ip);
                            }
                            object.prefix = 0;
                        }
                        if (message.ip != null && message.hasOwnProperty("ip"))
                            object.ip = options.bytes === String ? $util.base64.encode(message.ip, 0, message.ip.length) : options.bytes === Array ? Array.prototype.slice.call(message.ip) : message.ip;
                        if (message.prefix != null && message.hasOwnProperty("prefix"))
                            object.prefix = message.prefix;
                        return object;
                    };

                    /**
                     * Converts this CIDR to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    CIDR.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for CIDR
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.CIDR
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    CIDR.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.CIDR";
                    };

                    return CIDR;
                })();

                router.GeoIP = (function() {

                    /**
                     * Properties of a GeoIP.
                     * @memberof mihomo.component.geodata.router
                     * @interface IGeoIP
                     * @property {string|null} [countryCode] GeoIP countryCode
                     * @property {Array.<mihomo.component.geodata.router.ICIDR>|null} [cidr] GeoIP cidr
                     * @property {boolean|null} [reverseMatch] GeoIP reverseMatch
                     */

                    /**
                     * Constructs a new GeoIP.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a GeoIP.
                     * @implements IGeoIP
                     * @constructor
                     * @param {mihomo.component.geodata.router.IGeoIP=} [properties] Properties to set
                     */
                    function GeoIP(properties) {
                        this.cidr = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GeoIP countryCode.
                     * @member {string} countryCode
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @instance
                     */
                    GeoIP.prototype.countryCode = "";

                    /**
                     * GeoIP cidr.
                     * @member {Array.<mihomo.component.geodata.router.ICIDR>} cidr
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @instance
                     */
                    GeoIP.prototype.cidr = $util.emptyArray;

                    /**
                     * GeoIP reverseMatch.
                     * @member {boolean} reverseMatch
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @instance
                     */
                    GeoIP.prototype.reverseMatch = false;

                    /**
                     * Creates a new GeoIP instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIP=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.GeoIP} GeoIP instance
                     */
                    GeoIP.create = function create(properties) {
                        return new GeoIP(properties);
                    };

                    /**
                     * Encodes the specified GeoIP message. Does not implicitly {@link mihomo.component.geodata.router.GeoIP.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIP} message GeoIP message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoIP.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.countryCode != null && Object.hasOwnProperty.call(message, "countryCode"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.countryCode);
                        if (message.cidr != null && message.cidr.length)
                            for (let i = 0; i < message.cidr.length; ++i)
                                $root.mihomo.component.geodata.router.CIDR.encode(message.cidr[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        if (message.reverseMatch != null && Object.hasOwnProperty.call(message, "reverseMatch"))
                            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.reverseMatch);
                        return writer;
                    };

                    /**
                     * Encodes the specified GeoIP message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoIP.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIP} message GeoIP message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoIP.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GeoIP message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.GeoIP} GeoIP
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoIP.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.GeoIP();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.countryCode = reader.string();
                                    break;
                                }
                            case 2: {
                                    if (!(message.cidr && message.cidr.length))
                                        message.cidr = [];
                                    message.cidr.push($root.mihomo.component.geodata.router.CIDR.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 3: {
                                    message.reverseMatch = reader.bool();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GeoIP message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.GeoIP} GeoIP
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoIP.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GeoIP message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GeoIP.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.countryCode != null && message.hasOwnProperty("countryCode"))
                            if (!$util.isString(message.countryCode))
                                return "countryCode: string expected";
                        if (message.cidr != null && message.hasOwnProperty("cidr")) {
                            if (!Array.isArray(message.cidr))
                                return "cidr: array expected";
                            for (let i = 0; i < message.cidr.length; ++i) {
                                let error = $root.mihomo.component.geodata.router.CIDR.verify(message.cidr[i]);
                                if (error)
                                    return "cidr." + error;
                            }
                        }
                        if (message.reverseMatch != null && message.hasOwnProperty("reverseMatch"))
                            if (typeof message.reverseMatch !== "boolean")
                                return "reverseMatch: boolean expected";
                        return null;
                    };

                    /**
                     * Creates a GeoIP message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.GeoIP} GeoIP
                     */
                    GeoIP.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.GeoIP)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.GeoIP();
                        if (object.countryCode != null)
                            message.countryCode = String(object.countryCode);
                        if (object.cidr) {
                            if (!Array.isArray(object.cidr))
                                throw TypeError(".mihomo.component.geodata.router.GeoIP.cidr: array expected");
                            message.cidr = [];
                            for (let i = 0; i < object.cidr.length; ++i) {
                                if (typeof object.cidr[i] !== "object")
                                    throw TypeError(".mihomo.component.geodata.router.GeoIP.cidr: object expected");
                                message.cidr[i] = $root.mihomo.component.geodata.router.CIDR.fromObject(object.cidr[i]);
                            }
                        }
                        if (object.reverseMatch != null)
                            message.reverseMatch = Boolean(object.reverseMatch);
                        return message;
                    };

                    /**
                     * Creates a plain object from a GeoIP message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {mihomo.component.geodata.router.GeoIP} message GeoIP
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GeoIP.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.cidr = [];
                        if (options.defaults) {
                            object.countryCode = "";
                            object.reverseMatch = false;
                        }
                        if (message.countryCode != null && message.hasOwnProperty("countryCode"))
                            object.countryCode = message.countryCode;
                        if (message.cidr && message.cidr.length) {
                            object.cidr = [];
                            for (let j = 0; j < message.cidr.length; ++j)
                                object.cidr[j] = $root.mihomo.component.geodata.router.CIDR.toObject(message.cidr[j], options);
                        }
                        if (message.reverseMatch != null && message.hasOwnProperty("reverseMatch"))
                            object.reverseMatch = message.reverseMatch;
                        return object;
                    };

                    /**
                     * Converts this GeoIP to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GeoIP.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GeoIP
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.GeoIP
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GeoIP.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.GeoIP";
                    };

                    return GeoIP;
                })();

                router.GeoIPList = (function() {

                    /**
                     * Properties of a GeoIPList.
                     * @memberof mihomo.component.geodata.router
                     * @interface IGeoIPList
                     * @property {Array.<mihomo.component.geodata.router.IGeoIP>|null} [entry] GeoIPList entry
                     */

                    /**
                     * Constructs a new GeoIPList.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a GeoIPList.
                     * @implements IGeoIPList
                     * @constructor
                     * @param {mihomo.component.geodata.router.IGeoIPList=} [properties] Properties to set
                     */
                    function GeoIPList(properties) {
                        this.entry = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GeoIPList entry.
                     * @member {Array.<mihomo.component.geodata.router.IGeoIP>} entry
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @instance
                     */
                    GeoIPList.prototype.entry = $util.emptyArray;

                    /**
                     * Creates a new GeoIPList instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIPList=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.GeoIPList} GeoIPList instance
                     */
                    GeoIPList.create = function create(properties) {
                        return new GeoIPList(properties);
                    };

                    /**
                     * Encodes the specified GeoIPList message. Does not implicitly {@link mihomo.component.geodata.router.GeoIPList.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIPList} message GeoIPList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoIPList.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.entry != null && message.entry.length)
                            for (let i = 0; i < message.entry.length; ++i)
                                $root.mihomo.component.geodata.router.GeoIP.encode(message.entry[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified GeoIPList message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoIPList.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoIPList} message GeoIPList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoIPList.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GeoIPList message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.GeoIPList} GeoIPList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoIPList.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.GeoIPList();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.entry && message.entry.length))
                                        message.entry = [];
                                    message.entry.push($root.mihomo.component.geodata.router.GeoIP.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GeoIPList message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.GeoIPList} GeoIPList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoIPList.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GeoIPList message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GeoIPList.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.entry != null && message.hasOwnProperty("entry")) {
                            if (!Array.isArray(message.entry))
                                return "entry: array expected";
                            for (let i = 0; i < message.entry.length; ++i) {
                                let error = $root.mihomo.component.geodata.router.GeoIP.verify(message.entry[i]);
                                if (error)
                                    return "entry." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a GeoIPList message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.GeoIPList} GeoIPList
                     */
                    GeoIPList.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.GeoIPList)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.GeoIPList();
                        if (object.entry) {
                            if (!Array.isArray(object.entry))
                                throw TypeError(".mihomo.component.geodata.router.GeoIPList.entry: array expected");
                            message.entry = [];
                            for (let i = 0; i < object.entry.length; ++i) {
                                if (typeof object.entry[i] !== "object")
                                    throw TypeError(".mihomo.component.geodata.router.GeoIPList.entry: object expected");
                                message.entry[i] = $root.mihomo.component.geodata.router.GeoIP.fromObject(object.entry[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GeoIPList message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {mihomo.component.geodata.router.GeoIPList} message GeoIPList
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GeoIPList.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.entry = [];
                        if (message.entry && message.entry.length) {
                            object.entry = [];
                            for (let j = 0; j < message.entry.length; ++j)
                                object.entry[j] = $root.mihomo.component.geodata.router.GeoIP.toObject(message.entry[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this GeoIPList to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GeoIPList.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GeoIPList
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.GeoIPList
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GeoIPList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.GeoIPList";
                    };

                    return GeoIPList;
                })();

                router.GeoSite = (function() {

                    /**
                     * Properties of a GeoSite.
                     * @memberof mihomo.component.geodata.router
                     * @interface IGeoSite
                     * @property {string|null} [countryCode] GeoSite countryCode
                     * @property {Array.<mihomo.component.geodata.router.IDomain>|null} [domain] GeoSite domain
                     */

                    /**
                     * Constructs a new GeoSite.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a GeoSite.
                     * @implements IGeoSite
                     * @constructor
                     * @param {mihomo.component.geodata.router.IGeoSite=} [properties] Properties to set
                     */
                    function GeoSite(properties) {
                        this.domain = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GeoSite countryCode.
                     * @member {string} countryCode
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @instance
                     */
                    GeoSite.prototype.countryCode = "";

                    /**
                     * GeoSite domain.
                     * @member {Array.<mihomo.component.geodata.router.IDomain>} domain
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @instance
                     */
                    GeoSite.prototype.domain = $util.emptyArray;

                    /**
                     * Creates a new GeoSite instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSite=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.GeoSite} GeoSite instance
                     */
                    GeoSite.create = function create(properties) {
                        return new GeoSite(properties);
                    };

                    /**
                     * Encodes the specified GeoSite message. Does not implicitly {@link mihomo.component.geodata.router.GeoSite.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSite} message GeoSite message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoSite.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.countryCode != null && Object.hasOwnProperty.call(message, "countryCode"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.countryCode);
                        if (message.domain != null && message.domain.length)
                            for (let i = 0; i < message.domain.length; ++i)
                                $root.mihomo.component.geodata.router.Domain.encode(message.domain[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified GeoSite message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoSite.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSite} message GeoSite message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoSite.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GeoSite message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.GeoSite} GeoSite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoSite.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.GeoSite();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    message.countryCode = reader.string();
                                    break;
                                }
                            case 2: {
                                    if (!(message.domain && message.domain.length))
                                        message.domain = [];
                                    message.domain.push($root.mihomo.component.geodata.router.Domain.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GeoSite message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.GeoSite} GeoSite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoSite.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GeoSite message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GeoSite.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.countryCode != null && message.hasOwnProperty("countryCode"))
                            if (!$util.isString(message.countryCode))
                                return "countryCode: string expected";
                        if (message.domain != null && message.hasOwnProperty("domain")) {
                            if (!Array.isArray(message.domain))
                                return "domain: array expected";
                            for (let i = 0; i < message.domain.length; ++i) {
                                let error = $root.mihomo.component.geodata.router.Domain.verify(message.domain[i]);
                                if (error)
                                    return "domain." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a GeoSite message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.GeoSite} GeoSite
                     */
                    GeoSite.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.GeoSite)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.GeoSite();
                        if (object.countryCode != null)
                            message.countryCode = String(object.countryCode);
                        if (object.domain) {
                            if (!Array.isArray(object.domain))
                                throw TypeError(".mihomo.component.geodata.router.GeoSite.domain: array expected");
                            message.domain = [];
                            for (let i = 0; i < object.domain.length; ++i) {
                                if (typeof object.domain[i] !== "object")
                                    throw TypeError(".mihomo.component.geodata.router.GeoSite.domain: object expected");
                                message.domain[i] = $root.mihomo.component.geodata.router.Domain.fromObject(object.domain[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GeoSite message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {mihomo.component.geodata.router.GeoSite} message GeoSite
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GeoSite.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.domain = [];
                        if (options.defaults)
                            object.countryCode = "";
                        if (message.countryCode != null && message.hasOwnProperty("countryCode"))
                            object.countryCode = message.countryCode;
                        if (message.domain && message.domain.length) {
                            object.domain = [];
                            for (let j = 0; j < message.domain.length; ++j)
                                object.domain[j] = $root.mihomo.component.geodata.router.Domain.toObject(message.domain[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this GeoSite to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GeoSite.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GeoSite
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.GeoSite
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GeoSite.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.GeoSite";
                    };

                    return GeoSite;
                })();

                router.GeoSiteList = (function() {

                    /**
                     * Properties of a GeoSiteList.
                     * @memberof mihomo.component.geodata.router
                     * @interface IGeoSiteList
                     * @property {Array.<mihomo.component.geodata.router.IGeoSite>|null} [entry] GeoSiteList entry
                     */

                    /**
                     * Constructs a new GeoSiteList.
                     * @memberof mihomo.component.geodata.router
                     * @classdesc Represents a GeoSiteList.
                     * @implements IGeoSiteList
                     * @constructor
                     * @param {mihomo.component.geodata.router.IGeoSiteList=} [properties] Properties to set
                     */
                    function GeoSiteList(properties) {
                        this.entry = [];
                        if (properties)
                            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * GeoSiteList entry.
                     * @member {Array.<mihomo.component.geodata.router.IGeoSite>} entry
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @instance
                     */
                    GeoSiteList.prototype.entry = $util.emptyArray;

                    /**
                     * Creates a new GeoSiteList instance using the specified properties.
                     * @function create
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSiteList=} [properties] Properties to set
                     * @returns {mihomo.component.geodata.router.GeoSiteList} GeoSiteList instance
                     */
                    GeoSiteList.create = function create(properties) {
                        return new GeoSiteList(properties);
                    };

                    /**
                     * Encodes the specified GeoSiteList message. Does not implicitly {@link mihomo.component.geodata.router.GeoSiteList.verify|verify} messages.
                     * @function encode
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSiteList} message GeoSiteList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoSiteList.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.entry != null && message.entry.length)
                            for (let i = 0; i < message.entry.length; ++i)
                                $root.mihomo.component.geodata.router.GeoSite.encode(message.entry[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified GeoSiteList message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoSiteList.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {mihomo.component.geodata.router.IGeoSiteList} message GeoSiteList message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    GeoSiteList.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a GeoSiteList message from the specified reader or buffer.
                     * @function decode
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {mihomo.component.geodata.router.GeoSiteList} GeoSiteList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoSiteList.decode = function decode(reader, length, error) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.mihomo.component.geodata.router.GeoSiteList();
                        while (reader.pos < end) {
                            let tag = reader.uint32();
                            if (tag === error)
                                break;
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.entry && message.entry.length))
                                        message.entry = [];
                                    message.entry.push($root.mihomo.component.geodata.router.GeoSite.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a GeoSiteList message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {mihomo.component.geodata.router.GeoSiteList} GeoSiteList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    GeoSiteList.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a GeoSiteList message.
                     * @function verify
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    GeoSiteList.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.entry != null && message.hasOwnProperty("entry")) {
                            if (!Array.isArray(message.entry))
                                return "entry: array expected";
                            for (let i = 0; i < message.entry.length; ++i) {
                                let error = $root.mihomo.component.geodata.router.GeoSite.verify(message.entry[i]);
                                if (error)
                                    return "entry." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a GeoSiteList message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {mihomo.component.geodata.router.GeoSiteList} GeoSiteList
                     */
                    GeoSiteList.fromObject = function fromObject(object) {
                        if (object instanceof $root.mihomo.component.geodata.router.GeoSiteList)
                            return object;
                        let message = new $root.mihomo.component.geodata.router.GeoSiteList();
                        if (object.entry) {
                            if (!Array.isArray(object.entry))
                                throw TypeError(".mihomo.component.geodata.router.GeoSiteList.entry: array expected");
                            message.entry = [];
                            for (let i = 0; i < object.entry.length; ++i) {
                                if (typeof object.entry[i] !== "object")
                                    throw TypeError(".mihomo.component.geodata.router.GeoSiteList.entry: object expected");
                                message.entry[i] = $root.mihomo.component.geodata.router.GeoSite.fromObject(object.entry[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a GeoSiteList message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {mihomo.component.geodata.router.GeoSiteList} message GeoSiteList
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    GeoSiteList.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        let object = {};
                        if (options.arrays || options.defaults)
                            object.entry = [];
                        if (message.entry && message.entry.length) {
                            object.entry = [];
                            for (let j = 0; j < message.entry.length; ++j)
                                object.entry[j] = $root.mihomo.component.geodata.router.GeoSite.toObject(message.entry[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this GeoSiteList to JSON.
                     * @function toJSON
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    GeoSiteList.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for GeoSiteList
                     * @function getTypeUrl
                     * @memberof mihomo.component.geodata.router.GeoSiteList
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    GeoSiteList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/mihomo.component.geodata.router.GeoSiteList";
                    };

                    return GeoSiteList;
                })();

                return router;
            })();

            return geodata;
        })();

        return component;
    })();

    return mihomo;
})();

export { $root as default };

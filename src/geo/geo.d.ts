import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace mihomo. */
export namespace mihomo {

    /** Namespace component. */
    namespace component {

        /** Namespace geodata. */
        namespace geodata {

            /** Namespace router. */
            namespace router {

                /** Properties of a Domain. */
                interface IDomain {

                    /** Domain type */
                    type?: (mihomo.component.geodata.router.Domain.Type|null);

                    /** Domain value */
                    value?: (string|null);

                    /** Domain attribute */
                    attribute?: (mihomo.component.geodata.router.Domain.IAttribute[]|null);
                }

                /** Represents a Domain. */
                class Domain implements IDomain {

                    /**
                     * Constructs a new Domain.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.IDomain);

                    /** Domain type. */
                    public type: mihomo.component.geodata.router.Domain.Type;

                    /** Domain value. */
                    public value: string;

                    /** Domain attribute. */
                    public attribute: mihomo.component.geodata.router.Domain.IAttribute[];

                    /**
                     * Creates a new Domain instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Domain instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.IDomain): mihomo.component.geodata.router.Domain;

                    /**
                     * Encodes the specified Domain message. Does not implicitly {@link mihomo.component.geodata.router.Domain.verify|verify} messages.
                     * @param message Domain message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.IDomain, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Domain message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.Domain.verify|verify} messages.
                     * @param message Domain message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.IDomain, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Domain message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Domain
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.Domain;

                    /**
                     * Decodes a Domain message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Domain
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.Domain;

                    /**
                     * Verifies a Domain message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Domain message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Domain
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.Domain;

                    /**
                     * Creates a plain object from a Domain message. Also converts values to other types if specified.
                     * @param message Domain
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.Domain, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Domain to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Domain
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Domain {

                    /** Type enum. */
                    enum Type {
                        Plain = 0,
                        Regex = 1,
                        Domain = 2,
                        Full = 3
                    }

                    /** Properties of an Attribute. */
                    interface IAttribute {

                        /** Attribute key */
                        key?: (string|null);

                        /** Attribute boolValue */
                        boolValue?: (boolean|null);

                        /** Attribute intValue */
                        intValue?: (number|Long|null);
                    }

                    /** Represents an Attribute. */
                    class Attribute implements IAttribute {

                        /**
                         * Constructs a new Attribute.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: mihomo.component.geodata.router.Domain.IAttribute);

                        /** Attribute key. */
                        public key: string;

                        /** Attribute boolValue. */
                        public boolValue?: (boolean|null);

                        /** Attribute intValue. */
                        public intValue?: (number|Long|null);

                        /** Attribute typedValue. */
                        public typedValue?: ("boolValue"|"intValue");

                        /**
                         * Creates a new Attribute instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Attribute instance
                         */
                        public static create(properties?: mihomo.component.geodata.router.Domain.IAttribute): mihomo.component.geodata.router.Domain.Attribute;

                        /**
                         * Encodes the specified Attribute message. Does not implicitly {@link mihomo.component.geodata.router.Domain.Attribute.verify|verify} messages.
                         * @param message Attribute message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: mihomo.component.geodata.router.Domain.IAttribute, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Attribute message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.Domain.Attribute.verify|verify} messages.
                         * @param message Attribute message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: mihomo.component.geodata.router.Domain.IAttribute, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an Attribute message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Attribute
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.Domain.Attribute;

                        /**
                         * Decodes an Attribute message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Attribute
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.Domain.Attribute;

                        /**
                         * Verifies an Attribute message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an Attribute message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Attribute
                         */
                        public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.Domain.Attribute;

                        /**
                         * Creates a plain object from an Attribute message. Also converts values to other types if specified.
                         * @param message Attribute
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: mihomo.component.geodata.router.Domain.Attribute, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Attribute to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Attribute
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a CIDR. */
                interface ICIDR {

                    /** CIDR ip */
                    ip?: (Uint8Array|null);

                    /** CIDR prefix */
                    prefix?: (number|null);
                }

                /** Represents a CIDR. */
                class CIDR implements ICIDR {

                    /**
                     * Constructs a new CIDR.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.ICIDR);

                    /** CIDR ip. */
                    public ip: Uint8Array;

                    /** CIDR prefix. */
                    public prefix: number;

                    /**
                     * Creates a new CIDR instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CIDR instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.ICIDR): mihomo.component.geodata.router.CIDR;

                    /**
                     * Encodes the specified CIDR message. Does not implicitly {@link mihomo.component.geodata.router.CIDR.verify|verify} messages.
                     * @param message CIDR message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.ICIDR, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CIDR message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.CIDR.verify|verify} messages.
                     * @param message CIDR message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.ICIDR, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CIDR message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CIDR
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.CIDR;

                    /**
                     * Decodes a CIDR message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CIDR
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.CIDR;

                    /**
                     * Verifies a CIDR message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CIDR message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CIDR
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.CIDR;

                    /**
                     * Creates a plain object from a CIDR message. Also converts values to other types if specified.
                     * @param message CIDR
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.CIDR, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CIDR to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CIDR
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GeoIP. */
                interface IGeoIP {

                    /** GeoIP countryCode */
                    countryCode?: (string|null);

                    /** GeoIP cidr */
                    cidr?: (mihomo.component.geodata.router.ICIDR[]|null);

                    /** GeoIP reverseMatch */
                    reverseMatch?: (boolean|null);
                }

                /** Represents a GeoIP. */
                class GeoIP implements IGeoIP {

                    /**
                     * Constructs a new GeoIP.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.IGeoIP);

                    /** GeoIP countryCode. */
                    public countryCode: string;

                    /** GeoIP cidr. */
                    public cidr: mihomo.component.geodata.router.ICIDR[];

                    /** GeoIP reverseMatch. */
                    public reverseMatch: boolean;

                    /**
                     * Creates a new GeoIP instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GeoIP instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.IGeoIP): mihomo.component.geodata.router.GeoIP;

                    /**
                     * Encodes the specified GeoIP message. Does not implicitly {@link mihomo.component.geodata.router.GeoIP.verify|verify} messages.
                     * @param message GeoIP message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.IGeoIP, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GeoIP message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoIP.verify|verify} messages.
                     * @param message GeoIP message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.IGeoIP, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GeoIP message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GeoIP
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.GeoIP;

                    /**
                     * Decodes a GeoIP message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GeoIP
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.GeoIP;

                    /**
                     * Verifies a GeoIP message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GeoIP message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GeoIP
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.GeoIP;

                    /**
                     * Creates a plain object from a GeoIP message. Also converts values to other types if specified.
                     * @param message GeoIP
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.GeoIP, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GeoIP to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GeoIP
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GeoIPList. */
                interface IGeoIPList {

                    /** GeoIPList entry */
                    entry?: (mihomo.component.geodata.router.IGeoIP[]|null);
                }

                /** Represents a GeoIPList. */
                class GeoIPList implements IGeoIPList {

                    /**
                     * Constructs a new GeoIPList.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.IGeoIPList);

                    /** GeoIPList entry. */
                    public entry: mihomo.component.geodata.router.IGeoIP[];

                    /**
                     * Creates a new GeoIPList instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GeoIPList instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.IGeoIPList): mihomo.component.geodata.router.GeoIPList;

                    /**
                     * Encodes the specified GeoIPList message. Does not implicitly {@link mihomo.component.geodata.router.GeoIPList.verify|verify} messages.
                     * @param message GeoIPList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.IGeoIPList, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GeoIPList message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoIPList.verify|verify} messages.
                     * @param message GeoIPList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.IGeoIPList, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GeoIPList message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GeoIPList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.GeoIPList;

                    /**
                     * Decodes a GeoIPList message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GeoIPList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.GeoIPList;

                    /**
                     * Verifies a GeoIPList message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GeoIPList message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GeoIPList
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.GeoIPList;

                    /**
                     * Creates a plain object from a GeoIPList message. Also converts values to other types if specified.
                     * @param message GeoIPList
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.GeoIPList, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GeoIPList to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GeoIPList
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GeoSite. */
                interface IGeoSite {

                    /** GeoSite countryCode */
                    countryCode?: (string|null);

                    /** GeoSite domain */
                    domain?: (mihomo.component.geodata.router.IDomain[]|null);
                }

                /** Represents a GeoSite. */
                class GeoSite implements IGeoSite {

                    /**
                     * Constructs a new GeoSite.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.IGeoSite);

                    /** GeoSite countryCode. */
                    public countryCode: string;

                    /** GeoSite domain. */
                    public domain: mihomo.component.geodata.router.IDomain[];

                    /**
                     * Creates a new GeoSite instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GeoSite instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.IGeoSite): mihomo.component.geodata.router.GeoSite;

                    /**
                     * Encodes the specified GeoSite message. Does not implicitly {@link mihomo.component.geodata.router.GeoSite.verify|verify} messages.
                     * @param message GeoSite message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.IGeoSite, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GeoSite message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoSite.verify|verify} messages.
                     * @param message GeoSite message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.IGeoSite, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GeoSite message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GeoSite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.GeoSite;

                    /**
                     * Decodes a GeoSite message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GeoSite
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.GeoSite;

                    /**
                     * Verifies a GeoSite message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GeoSite message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GeoSite
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.GeoSite;

                    /**
                     * Creates a plain object from a GeoSite message. Also converts values to other types if specified.
                     * @param message GeoSite
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.GeoSite, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GeoSite to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GeoSite
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GeoSiteList. */
                interface IGeoSiteList {

                    /** GeoSiteList entry */
                    entry?: (mihomo.component.geodata.router.IGeoSite[]|null);
                }

                /** Represents a GeoSiteList. */
                class GeoSiteList implements IGeoSiteList {

                    /**
                     * Constructs a new GeoSiteList.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: mihomo.component.geodata.router.IGeoSiteList);

                    /** GeoSiteList entry. */
                    public entry: mihomo.component.geodata.router.IGeoSite[];

                    /**
                     * Creates a new GeoSiteList instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GeoSiteList instance
                     */
                    public static create(properties?: mihomo.component.geodata.router.IGeoSiteList): mihomo.component.geodata.router.GeoSiteList;

                    /**
                     * Encodes the specified GeoSiteList message. Does not implicitly {@link mihomo.component.geodata.router.GeoSiteList.verify|verify} messages.
                     * @param message GeoSiteList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: mihomo.component.geodata.router.IGeoSiteList, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GeoSiteList message, length delimited. Does not implicitly {@link mihomo.component.geodata.router.GeoSiteList.verify|verify} messages.
                     * @param message GeoSiteList message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: mihomo.component.geodata.router.IGeoSiteList, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GeoSiteList message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GeoSiteList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): mihomo.component.geodata.router.GeoSiteList;

                    /**
                     * Decodes a GeoSiteList message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GeoSiteList
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): mihomo.component.geodata.router.GeoSiteList;

                    /**
                     * Verifies a GeoSiteList message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GeoSiteList message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GeoSiteList
                     */
                    public static fromObject(object: { [k: string]: any }): mihomo.component.geodata.router.GeoSiteList;

                    /**
                     * Creates a plain object from a GeoSiteList message. Also converts values to other types if specified.
                     * @param message GeoSiteList
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: mihomo.component.geodata.router.GeoSiteList, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GeoSiteList to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GeoSiteList
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }
            }
        }
    }
}

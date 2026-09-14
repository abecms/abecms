/**
 * Fixed content schema of the ABECMS demo renderer.
 *
 * The schema is deliberately frozen and minimal: the public gateway accepts a
 * small, strictly allowlisted structured document and nothing else. Callers can
 * never provide templates, template names, file paths, URLs, markup or any
 * field that is not declared here.
 */

export const SCHEMA_VERSION = '1.0.0'

/** Hard limit of the accepted JSON body, in bytes. */
export const MAX_PAYLOAD_BYTES = 8192

export const STATUS_VALUES = ['draft', 'published']

export const FIELDS = [
  {
    name: 'title',
    type: 'string',
    abeType: 'text',
    required: true,
    minLength: 1,
    maxLength: 120,
    multiline: false,
    description: 'Main title of the demo page.',
  },
  {
    name: 'introduction',
    type: 'string',
    abeType: 'textarea',
    required: false,
    minLength: 0,
    maxLength: 600,
    multiline: true,
    description: 'Introduction paragraph. Plain text only, newlines allowed.',
  },
  {
    name: 'ctaLabel',
    type: 'string',
    abeType: 'text',
    required: false,
    minLength: 0,
    maxLength: 60,
    multiline: false,
    description: 'Label of the call-to-action.',
  },
  {
    name: 'status',
    type: 'enum',
    abeType: 'text',
    required: false,
    values: STATUS_VALUES,
    default: 'draft',
    description: 'Editorial status of the demo page.',
  },
]

const ALLOWED_KEYS = new Set(FIELDS.map((field) => field.name))

export const schema = Object.freeze({
  version: SCHEMA_VERSION,
  maxPayloadBytes: MAX_PAYLOAD_BYTES,
  contentType: 'application/json',
  fields: FIELDS,
})

class ValidationError extends Error {
  constructor(code, message, field) {
    super(message)
    this.name = 'ValidationError'
    this.code = code
    this.field = field
  }
}

/**
 * Remove characters that have no business in a plain text content field:
 * every C0/C1 control character except the newline, plus Unicode line/paragraph
 * separators. Rendering escaping is handled downstream by the ABECMS
 * Handlebars pipeline; this only normalises the stored document.
 */
function cleanText(value, {multiline}) {
  // eslint-disable-next-line no-control-regex
  let cleaned = value.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, '')
  cleaned = cleaned.replace(/[\u2028\u2029]/g, '')
  cleaned = multiline
    ? cleaned.replace(/\r\n?/g, '\n')
    : cleaned.replace(/\n/g, ' ')
  return cleaned.trim()
}

/**
 * Validate an incoming demo document against the frozen schema.
 *
 * @param {*} body parsed JSON body
 * @returns {Object} the accepted, normalised content document
 * @throws {ValidationError}
 */
export function validateContent(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('invalid_body', 'Body must be a JSON object.')
  }

  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new ValidationError('unknown_field', `Unknown field "${key}".`, key)
    }
  }

  const content = {}

  for (const field of FIELDS) {
    const raw = body[field.name]
    const provided = Object.prototype.hasOwnProperty.call(body, field.name)

    if (!provided || raw === undefined) {
      if (field.required) {
        throw new ValidationError(
          'missing_field',
          `Field "${field.name}" is required.`,
          field.name,
        )
      }
      content[field.name] = field.type === 'enum' ? field.default : ''
      continue
    }

    if (typeof raw !== 'string') {
      throw new ValidationError(
        'invalid_type',
        `Field "${field.name}" must be a string.`,
        field.name,
      )
    }

    if (field.type === 'enum') {
      if (!field.values.includes(raw)) {
        throw new ValidationError(
          'invalid_value',
          `Field "${field.name}" must be one of: ${field.values.join(', ')}.`,
          field.name,
        )
      }
      content[field.name] = raw
      continue
    }

    if (raw.length > field.maxLength) {
      throw new ValidationError(
        'too_long',
        `Field "${field.name}" exceeds ${field.maxLength} characters.`,
        field.name,
      )
    }

    const cleaned = cleanText(raw, field)

    if (field.required && cleaned.length < Math.max(field.minLength, 1)) {
      throw new ValidationError(
        'missing_field',
        `Field "${field.name}" is required.`,
        field.name,
      )
    }

    content[field.name] = cleaned
  }

  return content
}

export {ValidationError}

import { z } from 'zod'
import { MutationValidationError } from '@/lib/mutation-result'

export function parseFormMetadata<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  formData: FormData,
  fieldMap: Record<string, string>,
): z.infer<TSchema> {
  const input: Record<string, unknown> = {}

  for (const [formKey, schemaKey] of Object.entries(fieldMap)) {
    const value = formData.get(formKey)
    input[schemaKey] = value === '' || value === null ? undefined : value
  }

  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_root'
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
    }

    throw new MutationValidationError(fieldErrors)
  }

  return parsed.data
}

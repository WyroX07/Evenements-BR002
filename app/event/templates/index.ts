// Import custom event templates here
import EventTemplateCremant from './EventTemplate_Cremant'

/**
 * Custom Templates Registry
 *
 * Add your custom event templates here by mapping the event slug to the template component.
 *
 * Example:
 * export const customTemplates: Record<string, React.ComponentType<any>> = {
 *   'cremant-pionniers-2025': EventTemplate_CrementPionniers2025,
 *   'gala-scouts-2025': EventTemplate_GalaScouts2025,
 * }
 *
 * If no custom template is found for an event, the default template will be used.
 */

export const customTemplates: Record<string, React.ComponentType<any>> = {
  // Crémant template - use for any event slug containing 'cremant'
  'cremant': EventTemplateCremant,
  'cremant-pionniers': EventTemplateCremant,
  'cremant-2025': EventTemplateCremant,
  'cremant-pionniers-2025': EventTemplateCremant,
}

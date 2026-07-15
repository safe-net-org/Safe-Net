import { SimulatedEmailDto, SimulatedSiteDto } from '../dto/lesson-details.dto'

/**
 * Exposes the simulated message a phishing task asks about, minus
 * `meta.redFlags` — that array is the answer key, and anything returned here
 * ends up readable in the browser.
 *
 * Lives in one place because two controllers currently answer
 * `GET /learning/lessons/:id` (`LessonsController` and `ProgressController`),
 * so the mapping has to be identical in both services or the simulator works
 * on one route and silently not the other.
 */
export function buildSimulatorContent(meta: unknown): {
	email?: SimulatedEmailDto
	site?: SimulatedSiteDto
} {
	const payload = meta as {
		email?: SimulatedEmailDto
		site?: SimulatedSiteDto
	} | null

	if (payload?.email) return { email: payload.email }
	if (payload?.site) return { site: payload.site }
	return {}
}

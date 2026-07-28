import { NotFoundView } from '@/components/errors/NotFoundView'
import { getServerMessages } from '@/i18n/server'

export default async function NotFound() {
	const { t } = await getServerMessages()

	return <NotFoundView copy={t.notFound} />
}

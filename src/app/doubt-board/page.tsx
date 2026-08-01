import { prisma } from '@/lib/prisma'
import DoubtBoardClient from './DoubtBoardClient'

export const dynamic = 'force-dynamic'

export default async function DoubtBoardPage() {
  const questions = await prisma.question.findMany({
    include: {
      user: { select: { name: true } },
      answers: { select: { id: true, isBest: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <DoubtBoardClient initialQuestions={questions} />
}

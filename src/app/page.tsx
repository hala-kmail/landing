import Nav from '@/components/Nav'
import Story from '@/components/Story'
import HeroChapter from '@/components/chapters/HeroChapter'
import QuestionsChapter from '@/components/chapters/QuestionsChapter'
import WaitChapter from '@/components/chapters/WaitChapter'
import NumberChapter from '@/components/chapters/NumberChapter'
import TruthChapter from '@/components/chapters/TruthChapter'
import WhyChapter from '@/components/chapters/WhyChapter'
import AsksChapter from '@/components/chapters/AsksChapter'
import StepsChapter from '@/components/chapters/StepsChapter'
import LanguageChapter from '@/components/chapters/LanguageChapter'
import HandsChapter from '@/components/chapters/HandsChapter'
import MinutesChapter from '@/components/chapters/MinutesChapter'
import FinaleChapter from '@/components/chapters/FinaleChapter'
import After from '@/components/chapters/After'

export default function Page() {
  return (
    <>
      <a className="sr-only" href="#after">
        Skip the story
      </a>
      <Nav />
      <div className="loader" aria-hidden="true" />
      <main id="top">
        <HeroChapter />
        <QuestionsChapter />
        <WaitChapter />
        <NumberChapter />
        <TruthChapter />
        <WhyChapter />
        <AsksChapter />
        <StepsChapter />
        <LanguageChapter />
        <HandsChapter />
        <MinutesChapter />
        <FinaleChapter />
        <After />
      </main>
      <div className="veil" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Story />
    </>
  )
}

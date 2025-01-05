import { useState, useEffect } from 'react'
import { url } from '@utils/url-utils.ts'
import { i18n } from '@i18n/translation'
import I18nKey from '@i18n/i18nKey'
import { Icon } from '@iconify/react'

const fakeResult = [
  {
    url: url('/'),
    meta: {
      title: 'This Is a Fake Search Result',
    },
    excerpt:
      'Because the search cannot work in the <mark>dev</mark> environment.',
  },
  {
    url: url('/'),
    meta: {
      title: 'If You Want to Test the Search',
    },
    excerpt: 'Try running <mark>npm build && npm preview</mark> instead.',
  },
]

interface SearchResult {
  url: string
  meta: {
    title: string
  }
  excerpt: string
}

const SearchComponent: React.FC = () => {
  const [keywordDesktop, setKeywordDesktop] = useState('')
  const [keywordMobile, setKeywordMobile] = useState('')
  const [result, setResult] = useState<SearchResult[]>([])

  const togglePanel = () => {
    const panel = document.getElementById('search-panel')
    panel?.classList.toggle('float-panel-closed')
  }

  useEffect(() => {
    const search = async (keyword: string, isDesktop: boolean) => {
      const panel = document.getElementById('search-panel')
      if (!panel) return

      if (!keyword && isDesktop) {
        panel.classList.add('float-panel-closed')
        return
      }

      let arr = []

      if (import.meta.env.PROD) {
        // Assuming `pagefind` is available globally
        // @ts-ignore
        const ret = await pagefind.search(keyword)
        for (const item of ret.results) {
          arr.push(await item.data())
        }
      } else {
        arr = fakeResult
      }

      if (!arr.length && isDesktop) {
        panel.classList.add('float-panel-closed')
        return
      }

      if (isDesktop) {
        panel.classList.remove('float-panel-closed')
      }
      setResult(arr)
    }

    search(keywordDesktop, true)
    search(keywordMobile, false)
  }, [keywordDesktop, keywordMobile])

  return (
    <>
      {/* Search bar for desktop view */}
      <div
        id='search-bar'
        className='hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
          bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
          dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10'
      >
        <Icon
          icon='material-symbols:search'
          className='absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30'
        />
        <input
          placeholder={i18n(I18nKey.search)}
          value={keywordDesktop}
          onChange={e => setKeywordDesktop(e.target.value)}
          onFocus={() => setResult([])}
          className='transition-all pl-10 text-sm bg-transparent outline-0
            h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50'
        />
      </div>

      {/* Toggle button for phone/tablet view */}
      <button
        type='button'
        onClick={togglePanel}
        aria-label='Search Panel'
        id='search-switch'
        className='btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90'
      >
        <Icon icon='material-symbols:search' className='text-[1.25rem]' />
      </button>

      {/* Search panel */}
      <div
        id='search-panel'
        className='float-panel float-panel-closed search-panel absolute md:w-[30rem]
          top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2'
      >
        {/* Search bar inside panel for phone/tablet */}
        <div
          id='search-bar-inside'
          className='flex relative lg:hidden transition-all items-center h-11 rounded-xl
            bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
            dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10'
        >
          <Icon
            icon='material-symbols:search'
            className='absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30'
          />
          <input
            placeholder='Search'
            value={keywordMobile}
            onChange={e => setKeywordMobile(e.target.value)}
            className='pl-10 absolute inset-0 text-sm bg-transparent outline-0
              focus:w-60 text-black/50 dark:text-white/50'
          />
        </div>

        {/* Search results */}
        {result.map((item, index) => (
          <a
            key={item.url + index}
            href={item.url}
            className='transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
              rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]'
          >
            <div className='transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]'>
              {item.meta.title}
              <Icon
                icon='fa6-solid:chevron-right'
                className='transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]'
              />
            </div>
            <div
              className='transition text-sm text-50'
              // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
              dangerouslySetInnerHTML={{ __html: item.excerpt }}
            />
          </a>
        ))}
      </div>
    </>
  )
}

export default SearchComponent

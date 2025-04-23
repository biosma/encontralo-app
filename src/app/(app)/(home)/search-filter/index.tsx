import { Categories } from "./categories"
import { SearchInput } from "./search-input"

interface Props {
    data: any
}

export const SearchFilters = ({data} :Props) => {
  return (<div className="gap-4 px-4 lg:px-12 py-8 border-b flex flex-col w-full">
    <SearchInput/>
    <Categories data={data}/>
    </div>)
}
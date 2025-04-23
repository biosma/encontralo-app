import { Category } from "@/payload-types"
import { CategoryDropdown } from "./category-dropdown"

interface CategoriesProps {
    data: any
}

export const Categories = ({data} :CategoriesProps) => {
    return (
        <div className="relative w-full">

   <div className="flex flex-nowrap items-center">{data.map((category: Category) =>  
        <div key={category.id}>
            <CategoryDropdown category={category} isActive={false} isNavigarionHovered={false}/>
        </div>
    )}</div>
      </div>)
        }
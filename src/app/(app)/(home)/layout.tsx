import { getPayload } from "payload";
import  configPromise  from "@payload-config";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters } from "./search-filter";
import { Category } from "@/payload-types";


interface Props {
    children: React.ReactNode;
}

const payload = await getPayload({
  config: configPromise,
})

const data = await payload.find({
  collection: "categories",
  depth: 1,
  pagination: false,
  where: {
    parent: {
      exists: false,
    }
  }
})

const formattedData = data.docs.map((doc) => ({
  ...doc,
  subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
    // doc es tipo Category gracias a depth: 1
    ...(doc as Category),
  })),
}))

const Layout = async ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <SearchFilters data={formattedData}/>
        <div className="flex-1">
        {children}</div>
        <Footer/>
    </div>
  );
}

export default Layout;
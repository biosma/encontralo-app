import type { CollectionConfig } from 'payload';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'color',
      type: 'text',
    },
    {
      collection: 'categories',
      name: 'subcategories',
      type: 'join',
      on: 'parent',
      hasMany: true,
    },
    {
      relationTo: 'categories',
      name: 'parent',
      type: 'relationship',
      hasMany: false,
    },
  ],
};

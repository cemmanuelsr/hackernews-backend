import { extendType, nonNull, objectType, stringArg, idArg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';


export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  {
    id: 1,
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: 2,
    url: "graphql.org",
    description: "GraphQL official website",
  },
];

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return links;
      },
    });
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context) {
        const { description, url } = args;

        let idCount = links.length + 1;
        const link = {
          id: idCount,
          description: description,
          url: url,
        };
        links.push(link);
        return link;
      }
    });
    t.nonNull.field("delete", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },

      resolve(parent, args, context) {
        const { id } = args;
        const deleted_link = links.filter((link) => {
          if (link.id === parseInt(id)) {
            return link;
          };
        })[0];
        links = links.filter((link) => {
          if (link.id !== parseInt(id)) {
            return link;
          };
        });

        return deleted_link;
      }
    });
    t.nonNull.field("update", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        description: stringArg(),
        url: stringArg(),
      },

      resolve(parent, args, context) {
        const { id, description, url } = args;

        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if (link.id === parseInt(id)) {
            if (description != null) {
              link.description = description;
            };
            if (url != null) {
              link.url = url;
            };

            return link;
          };
        };
      },
    });
  },
});

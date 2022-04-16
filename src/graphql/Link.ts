import { extendType, nonNull, objectType, stringArg, idArg } from 'nexus';
import { NexusGenObjects } from '../../nexus-typegen';


export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve(parent, args, context, info) {
        return context.prisma.link.findMany();
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

        const newLink = context.prisma.link.create({
          data: {
            description: description,
            url: url,
          },
        });

        return newLink;
      },
    });
    t.nonNull.field("delete", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve(parent, args, context) {
        const { id } = args;
        const deletedLink = context.prisma.link.delete({
          where: {
            id: parseInt(id),
          },
        });

        return deletedLink;
      },
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
        type Data = {
          url?: string;
          description?: string;
        };
        const data: Data = {};
        if (description != null) {
          data.description = description
        };
        if (url != null) {
          data.url = url
        };

        const updatedLink = context.prisma.link.update({
          where: {
            id: parseInt(id),
          },
          data: data,
        });

        return updatedLink;
      },
    });
  },
});

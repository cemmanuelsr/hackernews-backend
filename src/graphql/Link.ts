import { extendType, nonNull, objectType, stringArg, idArg, intArg, inputObjectType, enumType, arg, list } from 'nexus';
import { Prisma } from '@prisma/client';
import { NexusGenObjects } from '../../nexus-typegen';


export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field("voters", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({ where: { id: parent.id } })
          .voters();
      }
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
      },
      async resolve(parent, args, context) {
        const where = args.filter
          ? {
            OR: [
              { description: { contains: args.filter } },
              { url: { contains: args.filter } },
            ],
          }
          : {};

        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
            | undefined,
        });

        const count = await context.prisma.link.count({ where });  // 2

        return {  // 3
          links,
          count,
        };
      },
    });
  },
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
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
        const { userId } = context;

        if (!userId) {
          throw new Error("Cannot post without logging in.");
        }

        const newLink = context.prisma.link.create({
          data: {
            description: description,
            url: url,
            postedBy: { connect: { id: userId } },
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
        const { userId } = context;

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

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link }); // 1
    t.nonNull.int("count"); // 2
  },
});


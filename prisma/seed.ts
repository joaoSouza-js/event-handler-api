import { faker } from "@faker-js/faker";
import { generateShortId } from "../src/utils/generateShortId";
import { generateSlug } from "../src/utils/generateSlug";
import { EVENT_DTO } from "../src/DTO/EVENT_DTO";
import { prisma } from "../src/services/prisma";

type createAttendsParams = {
    eventId: string;
    attendsAmount?: number;
};

const eventsAmount = 5
const attendeeAmountInEvent = 120

async function createEvents(eventAmount = 20) {
    const eventId = "26864c87-fcfe-4ec3-9788-f2e4bd1b7fff";

    const events = Array.from({ length: eventAmount }).map((_, index) => {
        const id = index === 0 ? eventId : faker.string.uuid();

        const eventTitle = `show em  ${faker.location.city()}`;

        const details = faker.word.words({ count: { min: 4, max: 12 } });
        const slug = `${generateSlug(eventTitle)}-${generateShortId(6)}`;
        const maximumAttendee = faker.number.int({
            min: 5,
            max: 9999,
        });

        const event: EVENT_DTO = {
            id: id,
            title: eventTitle,
            details: details,
            slug: slug,
            maximumAttendee: maximumAttendee,
        };

        return event;
    });

    const eventPromises = events.map((event) => {
        return prisma.event.create({
            data: {
                id: event.id,
                title: event.title,
                slug: event.slug,
                details: event.details,
                maximumAttendee: event.maximumAttendee,
            },
        });
    });

    const eventsResult = await Promise.all(eventPromises);

    return eventsResult;
}


async function createAttends({
    attendsAmount = 4,
    eventId,
}: createAttendsParams) {
    const attendeesEmptyArray = Array.from({ length: attendsAmount });

    const attendees = attendeesEmptyArray.map(() => {
        const name = faker.person.fullName();
        const email = faker.internet.email().toLocaleLowerCase();
        const createdAt = faker.date.recent({ days: 30 });
        const attendee = {
            name,
            email,
            createdAt,
        };

        return attendee;
    });

    const attendeesArrayPromises = attendees.map(async (attendee, index) => {
        const creteUserCheckIn = index % 2 === 0;

        if (creteUserCheckIn == true) {
            return prisma.attendee.create({
                data: {
                    email: attendee.email,
                    name: attendee.name,
                    eventId: eventId,
                    createdAt: attendee.createdAt,
                    checkIn: {
                        create: {
                           createdAt: faker.date.recent({days: 7}) 
                        }
                    },
                },
            });
        }
        return prisma.attendee.create({
            data: {
                email: attendee.email,
                name: attendee.name,
                eventId: eventId,
                createdAt: attendee.createdAt,
            },
        });
    });

    const attendeesResponse = await Promise.all(attendeesArrayPromises)

    return attendeesResponse
}

async function clearDatabase() {
    await prisma.checkIn.deleteMany()
    await prisma.attendee.deleteMany()
    await prisma.event.deleteMany();
}

export async function seed() {
    await clearDatabase()

    const events = await createEvents(eventsAmount);
    const eventsIds = events.map((event) => event.id);
   

    await Promise.all(eventsIds.map(eventId => {
        return  createAttends({
            eventId: eventId,
            attendsAmount: attendeeAmountInEvent
        })
    }))
}

seed()
    .then(() => {
        console.log("Databse seed de");
    })
    .finally(() => {
        prisma.$disconnect();
    });

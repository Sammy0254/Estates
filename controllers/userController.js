import asyncHandler from "express-async-handler"
import { prisma } from "../config/prismaConfig.js"

export const createUser = asyncHandler(async (req, res) => {
    console.log("Creating a user");

    let { email } = req.body
    const userExists = await prisma.user.findUnique({ where: { email } })

    if (!userExists) {
        const user = await prisma.user.create({ data: req.body })

        res.send({
            message: "User registered successfully",
            user: user,
        })
    }
    else res.status(201).send({ message: "User already registered" })
})

// CONTROLLER FUNCTION FOR A BOOK RESIDENCY VISIT
export const bookVisit = asyncHandler(async (req, res) => {
    const { email, date } = req.body
    const { id } = req.params

    try {
        const alreadyBooked = await prisma.user.findUnique({
            where: { email: email },
            select: { bookedVisits: true }
        })

        if (alreadyBooked.bookedVisits.some((visit) => visit.id === id)) {
            res.status(400).json({ message: "This residency is alreadyBooked by you" })
        }
        else {
            await prisma.user.update({
                where: { email: email },
                data: {
                    bookedVisits: { push: { id, date } }
                }
            })
            res.send("Your visit is booked successfully")
        }
    } catch (err) {
        throw new Error(err.message)
    }
})

// CONTROLLER FUNCTION FOR GETTING ALL BOOKINGS
export const getAllBookings = asyncHandler(async (req, res) => {
    const { email } = req.body
    try {
        const bookings = await prisma.user.findUnique({
            where: { email },
            select: { bookedVisits: true }
        })

        res.status(200).send(bookings)
    } catch (err) {
        throw new Error(err.message)
    }
})


// CONTROLLER FUNCTION FOR CANCEL A BOOKING OF USER
export const cancelBooking = asyncHandler(async (req, res) => {
    const { email } = req.body
    const { id } = req.params
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { bookedVisits: true }
        })

        const index = user.bookedVisits.findIndex((visit) => visit.id === id)

        if (index === -1) {
            res.status(404).json({ message: "Booking not found" })
            await prisma.user.update({
                where: { email },
                data: {
                    bookedVisits: user.bookedVisits
                }
            })
            res.send("Booking canceled successfully")
        }
    } catch (err) {
        throw new Error(err.message)
    }
})


// CONTROLLER FUNCTION FOR ADDING A RESIDENCY TO USER'S FAVORITES
export const toFav = asyncHandler(async (req, res) => {
    const { email } = req.body
    const { rid } = req.params
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (user.favResidenciesID.includes(rid)) {
            const updateUser = await prisma.user.update({
                where: { email },
                data: {
                    favResidenciesID: {
                        set: user.favResidenciesID.filter((id) => id !== rid)
                    }
                }
            })
            res.send({ message: "Removed from Favorites", user: updateUser })
        } else {
            const updateUser = await prisma.updateUser({
                where: { email },
                data: {
                    favResidenciesID: {
                        push: rid
                    }
                }
            })

            res.send({ message: "Updated Favorites", user: updateUser })
        }
    } catch (err) {
        throw new Error(err.message)
    }
})

// CONTROLLER FUNCTION FOR ALL FAVORITES
export const getAllFav = asyncHandler(async (req, res) => {
    const { email } = req.body
    try {
        const favResd = await prisma.user.findUnique({
            where: { email },
            select: { favResidenciesID: true }
        })
        res.status(200).send(favResd)
    } catch (err) {
        throw new Error(err.message)
    }
})
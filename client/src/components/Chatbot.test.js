import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Chatbot from "./Chatbot";

jest.mock("axios", () => ({ post: jest.fn() }));
jest.mock("react-markdown", () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock("react-hot-toast", () => ({ __esModule: true, default: { error: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  // Modern browsers can return a non-function from scrolling. React effects
  // must not use that value as cleanup when the assistant renders again.
  HTMLElement.prototype.scrollIntoView = jest.fn(() => Promise.resolve());
});

function openAssistant() {
  render(<React.StrictMode><MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Chatbot /></MemoryRouter></React.StrictMode>);
  fireEvent.click(screen.getByRole("button", { name: "Open assistant" }));
}

async function sendMessage() {
  fireEvent.change(screen.getByLabelText("Message the assistant"), { target: { value: "Help me find a doctor" } });
  fireEvent.click(screen.getByRole("button", { name: "Send", exact: true }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
}

test("the assistant remains usable after replies, closing and reopening", async () => {
  axios.post.mockResolvedValue({ data: { message: "Browse the doctor directory.", doctors: [] } });
  openAssistant();
  await sendMessage();
  await screen.findByText("Browse the doctor directory.");
  fireEvent.click(screen.getByRole("button", { name: "Close chat" }));
  fireEvent.click(screen.getByRole("button", { name: "Open assistant" }));
  expect(screen.getByRole("dialog", { name: "CuraLink Assistant" })).toBeTruthy();
  expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
});

test("an incomplete reply does not crash the page", async () => {
  axios.post.mockResolvedValue({ data: { message: { invalid: true }, doctors: [null, {}, { _id: "missing-user", name: "Doctor" }] } });
  openAssistant();
  await sendMessage();
  await screen.findByText("I couldn't read that response. Please try again.");
  expect(screen.queryByRole("button", { name: "Book a visit" })).toBeNull();
});

test("a failed request shows a usable recovery message", async () => {
  axios.post.mockRejectedValue(new Error("Offline"));
  openAssistant();
  await sendMessage();
  await screen.findByText("The assistant couldn't connect. Please try again, or browse the doctor directory.");
  expect(screen.getByLabelText("Message the assistant").disabled).toBe(false);
});

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import io from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FaPoll, FaTachometerAlt, FaUsers, FaChartBar, FaCog, FaQuestionCircle } from "react-icons/fa";
import { toast } from "sonner";

const Socket_URL = import.meta.env.VITE_SOCKET_URL;
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(Socket_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

type Poll = {
  id: string;
  question: string;
  options: string[];
  roomCode: string;
  creatorId: string;
  createdAt: Date;
  timer: number;
};

type RoomDetails = {
  code: string;
  creatorId: string;
  createdAt: string;
};

export default function StudentPollRoom() {
  const params = useParams({ from: "/student/pollroom/$code" });
  const roomCode = params.code;
  const navigate = useNavigate();

  const [joinedRoom, setJoinedRoom] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [answeredPolls, setAnsweredPolls] = useState<Record<string, number>>({});
  const [pollTimers, setPollTimers] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const [activeMenu, setActiveMenu] = useState<"room" | "previous" | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    socket.emit("join-room", roomCode);
    setJoinedRoom(true);
    loadRoomDetails(roomCode);

    const savedAnswers = localStorage.getItem(`answeredPolls_${roomCode}`);
    if (savedAnswers) setAnsweredPolls(JSON.parse(savedAnswers));

    localStorage.setItem("activeRoomCode", roomCode);
    localStorage.setItem("joinedRoom", "true");

    toast.success("Joined room!");
  }, [roomCode]);

  useEffect(() => {
    const listener = (poll: Poll) => {
      setPolls(prev => [...prev, poll]);
      toast("New poll received!");
    };

    socket.on("new-poll", listener);
    return () => {
      socket.off("new-poll", listener);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPollTimers(prev => {
        const updated: Record<string, number> = {};
        polls.forEach(p => {
          const current = prev[p.id] ?? p.timer;
          updated[p.id] = current > 0 ? current - 1 : 0;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [polls]);

  useEffect(() => {
    Object.entries(pollTimers).forEach(([pollId, time]) => {
      if (time === 0) setPolls(prev => prev.filter(p => p.id !== pollId));
    });
  }, [pollTimers]);

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem(`answeredPolls_${roomCode}`, JSON.stringify(answeredPolls));
    }
  }, [answeredPolls]);

  const loadRoomDetails = async (code: string) => {
    try {
      const res = await api.get(`/livequizzes/rooms/${code}`);
      if (res.data) setRoomDetails(res.data);
    } catch (e) {
      console.error("Failed to load room details:", e);
    }
  };

  const submitAnswer = async (pollId: string, answerIndex: number) => {
    try {
      await api.post(`/livequizzes/rooms/${roomCode}/polls/answer`, {
        pollId,
        userId: "student-456", // Replace with actual user ID from auth
        answerIndex,
      });
      setAnsweredPolls(prev => ({ ...prev, [pollId]: answerIndex }));
      toast.success("Vote submitted!");
    } catch {
      toast.error("Failed to submit vote");
    }
  };

  const exitRoom = () => {
    socket.emit("leave-room", roomCode);
    setJoinedRoom(false);
    setPolls([]);
    setAnsweredPolls({});
    setRoomDetails(null);
    localStorage.removeItem("activeRoomCode");
    localStorage.removeItem("joinedRoom");
    setActiveMenu(null);
    toast.info("Left the room.");
    navigate({ to: "/student/pollroom" });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "repeating-linear-gradient(0deg, #f5f8fd, #f5f8fd 24px, #e9eef6 25px, #e9eef6 26px), repeating-linear-gradient(90deg, #f5f8fd, #f5f8fd 24px, #e9eef6 25px, #e9eef6 26px)",
        fontFamily: "'Poppins', sans-serif",
        color: "#22223b",
      }}
    >
      <div className="container mx-auto mt-4 px-4">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar */}
          <aside
            className="rounded-xl p-6 shadow"
            style={{ background: "#fff", color: "#7b61ff", border: "1px solid #e9eef6" }}
          >
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg font-semibold bg-[#e9eef6] text-[#7b61ff]"><FaTachometerAlt className="mr-3" /> Dashboard</a></li>
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white"><FaPoll className="mr-3" /> My Polls</a></li>
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white"><FaUsers className="mr-3" /> Classes</a></li>
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white"><FaChartBar className="mr-3" /> Analytics</a></li>
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white"><FaCog className="mr-3" /> Settings</a></li>
              <li><a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#7b61ff] hover:text-white"><FaQuestionCircle className="mr-3" /> Help</a></li>
            </ul>
          </aside>

          {/* Main Poll Content */}
          <main className="rounded-xl p-8 shadow" style={{ background: "#fff", border: "1px solid #e9eef6" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#7b61ff]">Poll Room Code: {roomCode}</h2>
              <Button variant="outline" onClick={exitRoom}>❌ Leave Room</Button>
            </div>

            <div className="rounded-lg p-6" style={{ background: "#f5f8fd", border: "1px solid #e9eef6" }}>
              <h3 className="text-lg font-semibold mb-4 text-[#7b61ff]">Active Polls</h3>
              {polls.filter(p => answeredPolls[p.id] === undefined).length === 0 && (
                <div className="text-sm">Waiting for new polls...</div>
              )}
              {polls.filter(p => answeredPolls[p.id] === undefined).map(poll => (
                <div key={poll.id} className="mb-5 p-4 border border-[#e9eef6] rounded-lg bg-white">
                  <div className="font-semibold mb-1">{poll.question}</div>
                  <div className="text-xs text-gray-600 mb-2">Time left: {pollTimers[poll.id] ?? poll.timer}s</div>
                  <div className="space-y-2">
                    {poll.options.map((opt, i) => (
                      <Button
                        key={i}
                        className="w-full"
                        style={{
                          background: selectedOptions[poll.id] === i ? "#7b61ff" : "#fff",
                          color: selectedOptions[poll.id] === i ? "#fff" : "#22223b",
                          borderColor: "#7b61ff"
                        }}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [poll.id]: i }))}
                        disabled={(pollTimers[poll.id] ?? poll.timer) === 0 || answeredPolls[poll.id] !== undefined}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2">
                    {answeredPolls[poll.id] !== undefined ? (
                      <div className="text-green-600 text-sm">You have submitted this poll</div>
                    ) : (
                      <Button
                        className="mt-2 w-full"
                        style={{ background: "#ffa726", color: "#fff" }}
                        onClick={() => {
                          const selected = selectedOptions[poll.id];
                          if (selected !== null && selected !== undefined) {
                            submitAnswer(poll.id, selected);
                          } else {
                            toast.warning("Please select an option first");
                          }
                        }}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {activeMenu && (
              <div className="mt-6 p-4 border border-[#e9eef6] rounded-lg bg-white">
                {activeMenu === "room" && roomDetails && (
                  <>
                    <div className="font-semibold mb-2">Room Details</div>
                    <div className="text-sm">
                      Code: {roomDetails.code}<br />
                      Creator: {roomDetails.creatorId}<br />
                      Created: {new Date(roomDetails.createdAt).toLocaleString()}
                    </div>
                  </>
                )}
                {activeMenu === "previous" && (
                  <>
                    <div className="font-semibold mb-2">Previous Polls</div>
                    <div className="text-sm space-y-1">
                      {Object.keys(answeredPolls).length === 0 ? (
                        <div>No previous polls</div>
                      ) : (
                        polls.filter(p => answeredPolls[p.id] !== undefined).map(p => (
                          <div key={p.id}>✔ {p.question}: <b>{p.options[answeredPolls[p.id]]}</b></div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

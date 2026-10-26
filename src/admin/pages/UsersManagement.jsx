import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  UserRound,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import StatsCard from "../components/StatsCard";

function readUsers() {
  let users = [];

  try {
    const saved = JSON.parse(
      localStorage.getItem("ecopulseUsers") || "[]"
    );

    if (Array.isArray(saved)) {
      users = saved.map((user, index) => ({
        ...user,
        active: user.active !== false,
        __userIndex: index,
      }));
    }
  } catch {
    users = [];
  }

  // Show an older locally registered account if it is not in the new list.
  const email = localStorage.getItem("Email") || "";
  const role = localStorage.getItem("Role");

  if (
    email &&
    role !== "admin" &&
    !users.some(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    )
  ) {
    users.push({
      id: "legacy-local-user",
      firstName: localStorage.getItem("Firstname") || "",
      lastName: localStorage.getItem("Lastname") || "",
      email,
      phone: localStorage.getItem("Phone") || "",
      role: "user",
      active: localStorage.getItem("legacyUserActive") !== "false",
      __legacy: true,
    });
  }

  return users;
}

export default function UsersManagement() {
  const [users, setUsers] = useState(readUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const refreshUsers = () => setUsers(readUsers());

  useEffect(() => {
    window.addEventListener("storage", refreshUsers);
    window.addEventListener("userStatusUpdated", refreshUsers);

    return () => {
      window.removeEventListener("storage", refreshUsers);
      window.removeEventListener("userStatusUpdated", refreshUsers);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const name =
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.active) ||
        (statusFilter === "disabled" && !user.active);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const toggleUser = async (user) => {
    const nextActive = !user.active;

    const result = await Swal.fire({
      icon: "question",
      title: nextActive ? "Activate account?" : "Disable account?",
      text: nextActive
        ? "This account will be marked as active."
        : "This account will be marked as disabled.",
      showCancelButton: true,
      confirmButtonText: nextActive ? "Activate" : "Disable",
      cancelButtonText: "Cancel",
      confirmButtonColor: nextActive ? "#16a34a" : "#dc2626",
      background: "#111412",
      color: "#ffffff",
    });

    if (!result.isConfirmed) return;

    if (user.__legacy) {
      localStorage.setItem(
        "legacyUserActive",
        nextActive ? "true" : "false"
      );
    } else {
      let allUsers = [];

      try {
        const parsed = JSON.parse(
          localStorage.getItem("ecopulseUsers") || "[]"
        );

        allUsers = Array.isArray(parsed) ? parsed : [];
      } catch {
        allUsers = [];
      }

      const index = user.__userIndex;

      if (index == null || !allUsers[index]) return;

      allUsers[index] = {
        ...allUsers[index],
        active: nextActive,
      };

      localStorage.setItem("ecopulseUsers", JSON.stringify(allUsers));
    }

    setUsers(readUsers());
    window.dispatchEvent(new Event("userStatusUpdated"));

    await Swal.fire({
      icon: "success",
      title: nextActive ? "Account activated" : "Account disabled",
      timer: 1200,
      showConfirmButton: false,
      background: "#111412",
      color: "#ffffff",
    });
  };

  const activeCount = users.filter((user) => user.active).length;
  const disabledCount = users.length - activeCount;

  return (
    <div className="space-y-7">
      <section>
        <p className="text-xs font-bold uppercase tracking-[2px] text-emerald-400">
          Community
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Users Management
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          Search registered accounts and manage their local account status.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
        <StatsCard
          title="Registered Users"
          value={users.length}
          description="Accounts available in this browser"
          icon={Users}
          color="green"
        />

        <StatsCard
          title="Active Accounts"
          value={activeCount}
          description="Marked as active"
          icon={UserCheck}
          color="blue"
        />

        <StatsCard
          title="Disabled Accounts"
          value={disabledCount}
          description="Marked as disabled"
          icon={UserX}
          color="red"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D110F]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h3 className="font-extrabold text-white">All accounts</h3>

            <p className="mt-1 text-xs text-gray-500">
              {filteredUsers.length} matching account(s)
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#080A09] pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter users by status"
              className="h-11 rounded-xl border border-white/10 bg-[#080A09] px-3 text-sm text-gray-200 outline-none focus:border-emerald-400/50"
            >
              <option value="all">All accounts</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>

            <button
              type="button"
              onClick={refreshUsers}
              title="Refresh accounts"
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 px-3 text-gray-300 transition hover:bg-white/[0.05]"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Users size={28} className="mx-auto text-gray-500" />

            <p className="mt-4 font-bold text-white">No accounts found</p>

            <p className="mt-2 text-sm text-gray-500">
              Create a user account through the registration page to see it
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left">
              <thead className="bg-white/[0.02]">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {filteredUsers.map((user, index) => {
                  const displayName =
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "Unnamed user";

                  return (
                    <tr
                      key={`${user.id || user.email}-${user.__userIndex ?? index}`}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-white">
                              {displayName}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-500">
                              {user.__legacy
                                ? "Legacy local account"
                                : `User ${index + 1}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-400">
                        {user.email || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2.5 py-1.5 text-xs font-semibold text-blue-300">
                          <ShieldCheck size={13} />
                          User
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                            user.active
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.active ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />

                          {user.active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleUser(user)}
                          className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                            user.active
                              ? "border border-red-400/15 bg-red-400/[0.05] text-red-300 hover:bg-red-400/10"
                              : "bg-emerald-500 text-gray-950 hover:bg-emerald-400"
                          }`}
                        >
                          {user.active ? "Disable" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-gray-600">
        This screen manages locally saved accounts only. To administer users
        across devices, the project needs a server-side users database.
      </p>
    </div>
  );
}